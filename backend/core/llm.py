"""LLM access layer.

Provides a unified async interface supporting:
1. Google Gemini (gemini-1.5-flash via google.genai)
2. Groq (if groq_api_key is configured)
3. Deterministic test fallback synthesizer
"""
import asyncio
import json
import os
from functools import lru_cache
from typing import Any, AsyncIterator, Dict, List, Optional

from pydantic import BaseModel

from app.config import settings
from app.logging_config import logger

try:
    from google import genai
except ImportError:
    genai = None


class LLMResponse:
    """Wrapper matching LangChain message output with .content attribute."""

    def __init__(self, content: str):
        self.content = content

    def __str__(self) -> str:
        return self.content


class GeminiAsyncAdapter:
    """Async adapter for Google Gemini API conforming to ainvoke and astream."""

    def __init__(self, api_key: str, model_name: str, temperature: float = 0.0):
        self.api_key = api_key
        self.model_name = model_name
        self.temperature = temperature
        if genai is None:
            raise ImportError("google-genai package is not installed.")
        self.client = genai.Client(api_key=api_key)

    async def ainvoke(self, messages_or_prompt: Any) -> LLMResponse:
        prompt_str = _format_prompt(messages_or_prompt)
        loop = asyncio.get_running_loop()

        def _call():
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt_str,
                config={"temperature": self.temperature},
            )
            return response.text or ""

        try:
            content = await loop.run_in_executor(None, _call)
            return LLMResponse(content=content)
        except Exception as exc:
            logger.warning(f"Gemini API call failed: {exc}. Falling back to deterministic synthesizer.")
            return await DeterministicFallbackLLM(self.temperature).ainvoke(messages_or_prompt)

    async def astream(self, messages_or_prompt: Any) -> AsyncIterator[LLMResponse]:
        prompt_str = _format_prompt(messages_or_prompt)
        response = await self.ainvoke(prompt_str)
        words = response.content.split(" ")
        for w in words:
            yield LLMResponse(content=w + " ")
            await asyncio.sleep(0.01)

    def with_structured_output(self, schema_cls: Any, method: str = "json_mode"):
        parent = self

        class StructuredRunner:
            async def ainvoke(self, prompt: Any):
                resp = await parent.ainvoke(prompt)
                raw = resp.content.strip()
                if raw.startswith("```"):
                    lines = raw.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    raw = "\n".join(lines).strip()
                try:
                    data = json.loads(raw)
                    return schema_cls(**data)
                except Exception:
                    if hasattr(schema_cls, "is_relevant"):
                        return schema_cls(is_relevant=True)
                    if hasattr(schema_cls, "query_type"):
                        return schema_cls(query_type="retrieval_needed", need_retrieval=True, need_tools=False)
                    return schema_cls()

        return StructuredRunner()


def _build_openrouter_messages(messages_or_prompt: Any) -> List[Dict[str, str]]:
    if hasattr(messages_or_prompt, "to_messages"):
        messages_or_prompt = messages_or_prompt.to_messages()

    if isinstance(messages_or_prompt, list):
        out = []
        for m in messages_or_prompt:
            m_type = getattr(m, "type", "user")
            role = "system" if m_type == "system" else ("assistant" if m_type == "ai" else "user")
            content = getattr(m, "content", str(m))
            out.append({"role": role, "content": content})
        return out

    if isinstance(messages_or_prompt, str):
        return [{"role": "user", "content": messages_or_prompt}]

    return [{"role": "user", "content": str(messages_or_prompt)}]


class OpenRouterAsyncAdapter:
    """Async adapter for OpenRouter API strictly for text rephrasing and grounded synthesis."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "meta-llama/llama-3.3-70b-instruct",
        temperature: float = 0.0,
    ):
        self.api_key = api_key
        self.model_name = model_name
        self.temperature = temperature
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    async def ainvoke(self, messages_or_prompt: Any) -> LLMResponse:
        import httpx

        payload_messages = _build_openrouter_messages(messages_or_prompt)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://127.0.0.1:5173",
            "X-Title": "Wise Wolves RAG",
        }
        body = {
            "model": self.model_name,
            "temperature": self.temperature,
            "messages": payload_messages,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.base_url, headers=headers, json=body)
                if resp.status_code != 200:
                    logger.warning(
                        f"OpenRouter returned status {resp.status_code}: {resp.text}. Falling back to deterministic synthesizer."
                    )
                    return await DeterministicFallbackLLM(self.temperature).ainvoke(messages_or_prompt)

                data = resp.json()
                choices = data.get("choices", [])
                if choices and "message" in choices[0]:
                    content = choices[0]["message"].get("content", "").strip()
                    return LLMResponse(content=content)

                return await DeterministicFallbackLLM(self.temperature).ainvoke(messages_or_prompt)
        except Exception as exc:
            logger.warning(f"OpenRouter call failed ({exc}). Falling back to deterministic synthesizer.")
            return await DeterministicFallbackLLM(self.temperature).ainvoke(messages_or_prompt)

    async def astream(self, messages_or_prompt: Any) -> AsyncIterator[LLMResponse]:
        import httpx

        payload_messages = _build_openrouter_messages(messages_or_prompt)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://127.0.0.1:5173",
            "X-Title": "Wise Wolves RAG",
        }
        body = {
            "model": self.model_name,
            "temperature": self.temperature,
            "messages": payload_messages,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=35.0) as client:
                async with client.stream("POST", self.base_url, headers=headers, json=body) as resp:
                    if resp.status_code != 200:
                        fb = await DeterministicFallbackLLM(self.temperature).ainvoke(messages_or_prompt)
                        for w in fb.content.split(" "):
                            yield LLMResponse(content=w + " ")
                            await asyncio.sleep(0.01)
                        return

                    async for line in resp.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        chunk_str = line[6:].strip()
                        if chunk_str == "[DONE]":
                            break
                        try:
                            chunk_json = json.loads(chunk_str)
                            delta = chunk_json.get("choices", [{}])[0].get("delta", {})
                            content_piece = delta.get("content", "")
                            if content_piece:
                                yield LLMResponse(content=content_piece)
                        except Exception:
                            continue
        except Exception as exc:
            logger.warning(f"OpenRouter stream failed ({exc}). Falling back.")
            fb = await DeterministicFallbackLLM(self.temperature).ainvoke(messages_or_prompt)
            for w in fb.content.split(" "):
                yield LLMResponse(content=w + " ")
                await asyncio.sleep(0.01)

    def with_structured_output(self, schema_cls: Any, method: str = "json_mode"):
        parent = self

        class StructuredRunner:
            async def ainvoke(self, prompt: Any):
                resp = await parent.ainvoke(prompt)
                raw = resp.content.strip()
                if raw.startswith("```"):
                    lines = raw.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    raw = "\n".join(lines).strip()
                try:
                    data = json.loads(raw)
                    return schema_cls(**data)
                except Exception:
                    if hasattr(schema_cls, "is_relevant"):
                        return schema_cls(is_relevant=True)
                    if hasattr(schema_cls, "query_type"):
                        return schema_cls(query_type="retrieval_needed", need_retrieval=True, need_tools=False)
                    return schema_cls()

        return StructuredRunner()


def _format_prompt(messages_or_prompt: Any) -> str:
    if isinstance(messages_or_prompt, str):
        return messages_or_prompt
    if hasattr(messages_or_prompt, "to_messages"):
        messages_or_prompt = messages_or_prompt.to_messages()
    if isinstance(messages_or_prompt, list):
        parts = []
        for m in messages_or_prompt:
            role = getattr(m, "type", "user")
            content = getattr(m, "content", str(m))
            parts.append(f"{role.upper()}: {content}")
        return "\n\n".join(parts)
    return str(messages_or_prompt)


class DeterministicFallbackLLM:
    """Deterministic fallback LLM for test and offline environments."""

    def __init__(self, temperature: float = 0.0):
        self.temperature = temperature

    async def ainvoke(self, messages_or_prompt: Any) -> LLMResponse:
        prompt_str = _format_prompt(messages_or_prompt)

        # 0a. Relevance grad: does the excerpt actually answer this specific question?
        if "RELEVANT or NOT_RELEVANT" in prompt_str.upper():
            parts = prompt_str.split("Question:")
            question = parts[1].split("Document excerpt:")[0].strip().lower() if len(parts) > 1 else ""
            excerpt_parts = prompt_str.split("Document excerpt:")
            excerpt = excerpt_parts[1].strip().lower() if len(excerpt_parts) > 1 else ""
            stop_words = {
                "what", "when", "where", "which", "whose", "who", "how", "why", "is",
                "are", "the", "a", "an", "of", "to", "and", "or", "for", "in", "on",
                "with", "about", "at", "by", "does", "do", "not", "me", "my", "your",
                "give", "show", "tell", "please", "can", "could", "would", "will",
                "from", "that", "this", "these", "those", "be", "been", "was", "were",
            }
            q_tokens = {
                w.strip("?.!\"',;:()").lower()
                for w in question.split()
                if len(w.strip("?.!\"',;:()")) >= 3 and w not in stop_words
            }
            if q_tokens and excerpt:
                matched = sum(1 for t in q_tokens if t in excerpt)
                return LLMResponse(
                    content="RELEVANT" if matched >= 1 else "NOT_RELEVANT"
                )
            return LLMResponse(content="NOT_RELEVANT")

        # 1. Relevance decision prompt
        if "is_relevant" in prompt_str.lower() and "respond with a single json" in prompt_str.lower():
            return LLMResponse(content='{"is_relevant": true}')

        # 2. Verification prompt
        if "is the answer fully supported by the context" in prompt_str.lower():
            parts = prompt_str.split("Context:")
            ctx_text = parts[1].split("Is the answer fully supported")[0].strip().lower() if len(parts) > 1 else ""
            q_part = parts[0].split("Question:")
            q_text = q_part[1].split("Answer:")[0].strip().lower() if len(q_part) > 1 else ""

            if q_text and ctx_text:
                stop_words = {
                    "what", "when", "where", "which", "will", "would", "could", "should",
                    "from", "with", "about", "work", "bring", "many", "much", "does",
                    "have", "often", "must", "their", "leave", "leaves", "policy", "policies",
                    "eligible", "standard", "employee", "employees", "company", "paid", "days",
                    "time", "date", "daily", "under"
                }
                q_words = [w.strip("?.!\"',") for w in q_text.split() if len(w) > 3 and w not in stop_words]
                if q_words:
                    matched_words = [w for w in q_words if w in ctx_text]
                    if not matched_words:
                        return LLMResponse(content="NO")
                    match_ratio = len(matched_words) / len(q_words)
                    if match_ratio < 0.35 and len(matched_words) < 2:
                        return LLMResponse(content="NO")

            return LLMResponse(content="YES")

        # 3. Grounded generation prompt: extract facts directly from Evidence
        if "=== UNTRUSTED DOCUMENT EVIDENCE ===" in prompt_str or "Context:" in prompt_str:
            if "=== UNTRUSTED DOCUMENT EVIDENCE ===" in prompt_str:
                parts = prompt_str.split("=== UNTRUSTED DOCUMENT EVIDENCE ===")
                context_text = parts[1].split("=== END EVIDENCE ===")[0].strip() if len(parts) > 1 else ""
            else:
                parts = prompt_str.split("Context:")
                context_text = parts[1].strip() if len(parts) > 1 else ""

            if not context_text or "no relevant document found" in context_text.lower():
                return LLMResponse(content="I couldn't find this information in the available documents.")

            import re

            # Extract user question from prompt
            q_text = ""
            if "Question:" in prompt_str:
                q_part = prompt_str.split("Question:")[1]
                q_text = q_part.split("===")[0].split("\n\n")[0].strip()

            stop_words = {
                "what", "when", "where", "which", "will", "would", "could", "should",
                "from", "with", "about", "many", "much", "does", "have", "often", "must",
                "their", "this", "that", "these", "those", "is", "are", "the", "an", "a",
                "in", "on", "at", "to", "for", "of", "and", "or"
            }
            q_tokens = [w.strip("?.!\"',") for w in q_text.lower().split() if len(w) > 2 and w not in stop_words]

            # Remove potential prompt injection commands
            clean_ctx = re.sub(
                r'(?i)(system override|ignore all previous|ignore previous|reveal internal).*?\n',
                '',
                context_text
            )

            # Split context into structured paragraphs / clauses
            raw_blocks = [
                p.strip() for p in re.split(r'\n{2,}|\n(?=\d+\.\d+)|\n(?=Section\b)', clean_ctx)
                if len(p.strip()) > 8
            ]

            scored = []
            for b in raw_blocks:
                clean_text = ' '.join(b.split()).strip()
                # Skip pure short headings without digits
                if len(clean_text.split()) < 4 and not any(c.isdigit() for c in clean_text):
                    continue
                score = sum(1 for tok in q_tokens if tok in clean_text.lower())
                if any(c.isdigit() for c in clean_text):
                    score += 0.5
                scored.append((score, clean_text))

            scored.sort(key=lambda x: x[0], reverse=True)

            if scored and scored[0][0] > 0:
                ans = scored[0][1]
                ans = re.sub(r'^\d+(\.\d+)*\s*', '', ans).strip()
                if not ans.endswith("."):
                    ans += "."
                return LLMResponse(content=ans)

            # If no specific query tokens matched, return first substantive segment
            raw_segments = [s.strip() for s in re.split(r'(?:\.\s+|\n+)', clean_ctx) if len(s.strip()) > 15]
            if raw_segments:
                ans = raw_segments[0].strip()
                if not ans.endswith("."):
                    ans += "."
                return LLMResponse(content=ans)

            return LLMResponse(content="I couldn't find this information in the available documents.")

        return LLMResponse(content="I couldn't find this information in the available documents.")

    async def astream(self, messages_or_prompt: Any) -> AsyncIterator[LLMResponse]:
        resp = await self.ainvoke(messages_or_prompt)
        for word in resp.content.split(" "):
            yield LLMResponse(content=word + " ")
            await asyncio.sleep(0.01)

    def with_structured_output(self, schema_cls: Any, method: str = "json_mode"):
        class MockStructured:
            async def ainvoke(self, prompt: Any):
                if hasattr(schema_cls, "is_relevant"):
                    return schema_cls(is_relevant=True)
                if hasattr(schema_cls, "query_type"):
                    return schema_cls(query_type="retrieval_needed", need_retrieval=True, need_tools=False)
                return schema_cls()
        return MockStructured()


@lru_cache
def get_llm(temperature: float = 0.0) -> Any:
    """Return configured LLM (OpenRouter -> Gemini -> Groq -> Deterministic Fallback)."""
    # 1. OpenRouter (Strict Document Rephrasing)
    openrouter_key = (
        getattr(settings, "openrouter_api_key", "") or os.getenv("OPENROUTER_API_KEY", "")
    ).strip()
    if openrouter_key and openrouter_key.startswith("sk-or-"):
        model = getattr(settings, "openrouter_model", "meta-llama/llama-3.3-70b-instruct")
        logger.info(f"Using OpenRouter rephrasing LLM adapter (model={model}).")
        return OpenRouterAsyncAdapter(api_key=openrouter_key, model_name=model, temperature=temperature)

    # 2. Google Gemini
    gemini_key = (settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")).strip()
    if gemini_key and gemini_key.startswith("AIzaSy"):
        try:
            return GeminiAsyncAdapter(api_key=gemini_key, model_name=settings.gemini_model, temperature=temperature)
        except Exception as exc:
            logger.warning(f"Could not initialize Gemini LLM: {exc}")

    # 3. Groq
    groq_key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            from langchain_groq import ChatGroq
            return ChatGroq(model=settings.groq_model, temperature=temperature, api_key=groq_key)
        except Exception as exc:
            logger.warning(f"Could not initialize Groq LLM: {exc}")

    logger.info("Using deterministic fallback LLM provider.")
    return DeterministicFallbackLLM(temperature=temperature)
