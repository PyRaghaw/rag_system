export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  chunksCount: number;
  status: 'uploading' | 'extracting' | 'chunking' | 'embedding' | 'indexing' | 'ready';
  uploadDate: string;
  category: string;
  selected?: boolean;
  progress?: number;
  topics?: string[];
  relevanceScore?: number;
}

export interface CitationSource {
  id: string;
  docName: string;
  section: string;
  page?: number;
  textSnippet: string;
  confidence: number;
  fullSectionContent?: string;
}

export interface ImageAttachment {
  image_id: string;
  url: string;
  document: string;
  page?: number;
  section?: string;
  caption?: string;
  mime_type?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  grounded?: boolean;
  sources?: CitationSource[];
  images?: ImageAttachment[];
  retrievalConfidence?: 'High' | 'Medium' | 'Low';
  chunksSearched?: number;
  sourcesUsedCount?: number;
  documentsSearchedCount?: number;
  responseTimeMs?: number;
  isRefusal?: boolean;
  isAmbiguous?: boolean;
  clarificationTopics?: string[];
}

export interface RAGPipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  detail?: string;
}

export interface AppSettings {
  aiModel: string;
  retrievedChunks: number;
  similarityThreshold: number;
  citationBehavior: 'Required' | 'Optional';
  groundingMode: 'Documents Only' | 'Hybrid';
}

export interface StudioArtifact {
  type: 'Audio Overview' | 'Slide Deck' | 'Video Overview' | 'Mind Map' | 'Reports' | 'Flashcards' | 'Quiz' | 'Infographic' | 'Data Table';
  title: string;
  content: any;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role?: string;
  isGuest?: boolean;
}

