/**
 * Unified Enterprise RAG Assistant API Client
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.PROD
      ? ''
      : 'http://localhost:8000';

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export class ApiException extends Error {
  public code: string;
  public status: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.status = error.status;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new ApiException({
      code: `HTTP_${response.status}`,
      message: errorDetail,
      status: response.status,
    });
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

// Health API
export interface HealthResponse {
  status: string;
  service?: string;
  mode?: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/api/health');
}

// Chat API & Types
export interface SourceCitationApi {
  document: string;
  document_name?: string;
  document_id?: string;
  page?: number | null;
  section?: string | null;
  snippet: string;
}

export interface ImageAttachmentApi {
  image_id: string;
  url: string;
  document: string;
  page?: number | null;
  section?: string | null;
  caption?: string | null;
  mime_type?: string | null;
}

export interface ChatResponseApi {
  question: string;
  answer: string;
  found: boolean;
  grounded: boolean;
  needs_clarification: boolean;
  sources: SourceCitationApi[];
  images?: ImageAttachmentApi[];
  thread_id: string;
  conversation_id?: string;
  message_id?: string;
}

export interface ChatStreamCallbacks {
  onInit?: (data: { thread_id: string; conversation_id?: string }) => void;
  onValidation?: (data: { is_valid: boolean; needs_clarification: boolean }) => void;
  onRetrieval?: (data: { chunks_retrieved: number; top_similarity: number }) => void;
  onRelevanceGate?: (data: { passed: boolean }) => void;
  onToken?: (token: string) => void;
  onDone?: (data: ChatResponseApi) => void;
  onError?: (error: string) => void;
}

export async function sendChat(
  message: string,
  conversationId?: string,
  documents?: string[]
): Promise<ChatResponseApi> {
  return request<ChatResponseApi>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      question: message,
      thread_id: conversationId,
      conversation_id: conversationId,
      documents: documents || [],
      selected_documents: documents || [],
    }),
  });
}

export async function streamChat(
  message: string,
  conversationId: string | undefined,
  callbacks: ChatStreamCallbacks,
  documents?: string[]
): Promise<void> {
  const url = `${API_BASE_URL}/api/chat/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      message,
      question: message,
      thread_id: conversationId,
      conversation_id: conversationId,
      documents: documents || [],
      selected_documents: documents || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Stream failed with HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by browser environment.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let currentEvent = 'message';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) {
        currentEvent = 'message';
        continue;
      }

      if (trimmed.startsWith('event: ')) {
        currentEvent = trimmed.slice(7).trim();
        continue;
      }

      if (trimmed.startsWith('data: ')) {
        const rawJson = trimmed.slice(6).trim();
        if (rawJson === '[DONE]') continue;

        try {
          const parsed = JSON.parse(rawJson);
          const eventType = parsed.event || currentEvent;
          const dataPayload = parsed.data !== undefined ? parsed.data : parsed;

          switch (eventType) {
            case 'init':
              callbacks.onInit?.(dataPayload);
              break;
            case 'validation':
              callbacks.onValidation?.(dataPayload);
              break;
            case 'retrieval':
              callbacks.onRetrieval?.(dataPayload);
              break;
            case 'relevance_gate':
              callbacks.onRelevanceGate?.(dataPayload);
              break;
            case 'token':
              callbacks.onToken?.(dataPayload.text || dataPayload.token || (typeof dataPayload === 'string' ? dataPayload : ''));
              break;
            case 'done':
              callbacks.onDone?.(dataPayload);
              break;
            case 'error':
              callbacks.onError?.(dataPayload.detail || dataPayload.message || 'Stream processing error');
              break;
            default:
              if (currentEvent === 'token') {
                callbacks.onToken?.(dataPayload.text || rawJson);
              }
              break;
          }
        } catch {
          if (currentEvent === 'token') {
            callbacks.onToken?.(rawJson);
          }
        }
      }
    }
  }
}

// Documents API & Types
export interface IngestItemResponse {
  filename: string;
  chunks_ingested: number;
  document_id?: string;
  status: string;
  chunks?: number;
}

export interface DocumentInfoResponse {
  filename: string;
  chunk_count: number;
}

export interface DeleteDocumentResponse {
  filename: string;
  chunks_deleted: number;
}

export async function uploadDocuments(files: File[]): Promise<IngestItemResponse[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  return request<IngestItemResponse[]>('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function getDocuments(): Promise<DocumentInfoResponse[]> {
  return request<DocumentInfoResponse[]>('/api/documents');
}

export async function deleteDocument(filename: string): Promise<DeleteDocumentResponse> {
  return request<DeleteDocumentResponse>(`/api/documents/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });
}

// Conversations API & Types
export interface ConversationSummary {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  images?: any[];
  verification?: string;
  created_at?: string;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  return request<ConversationSummary[]>('/api/conversations');
}

export async function getConversationMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  return request<ConversationMessage[]>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`
  );
}

export async function deleteConversation(
  conversationId: string
): Promise<{ status: string }> {
  return request<{ status: string }>(
    `/api/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function renameConversation(
  conversationId: string,
  newTitle: string
): Promise<{ status: string }> {
  return request<{ status: string }>(
    `/api/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ title: newTitle }),
    }
  );
}
