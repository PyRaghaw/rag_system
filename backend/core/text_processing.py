"""
Text processing and cleaning utilities.

Includes:
- Conservative text cleaning (whitespace normalization, artifact removal)
- Section/heading detection for citation metadata
- Lightweight stemming utility (pure Python, zero-dependency)
"""
import re
import unicodedata
from typing import List

try:
    from nltk.stem import PorterStemmer
    _stemmer = PorterStemmer()
except Exception:
    _stemmer = None

_PUNCT = ".,!?;:()[]{}\"'"

_HEADING_PATTERNS = [
    re.compile(r"^(?:section\s+[\d\.]+|article\s+[\d\.]+|clause\s+[\d\.]+|chapter\s+[\d\.]+|slide\s+[\d\.]+)\s*[:\-–]?\s*.*$", re.IGNORECASE),
    re.compile(r"^\d+(?:\.\d+)*\s+[A-Za-z0-9\s\-_,()&/]{2,80}$"),
    re.compile(r"^[A-Z][A-Z0-9\s\-_,():/&]{2,70}$"),
    # Title Case headings (e.g., 'User Architecture Diagram', 'Technical Approach')
    re.compile(r"^[A-Z][a-zA-Z0-9\s\-_,():/&]{2,70}$"),
    # Structural diagram / section headers
    re.compile(r".*(?:architecture|diagram|workflow|flowchart|pipeline|framework|methodology|solution|overview|approach|tech used).*", re.IGNORECASE),
]


def clean_text(raw_text: str) -> str:
    """Conservatively cleans extracted text without losing content or structure."""
    if not raw_text:
        return ""

    text = unicodedata.normalize("NFKC", raw_text)

    cleaned_chars = []
    for ch in text:
        if ch in ("\n", "\r", "\t") or (unicodedata.category(ch)[0] != "C" and ord(ch) >= 32):
            cleaned_chars.append(ch)
    text = "".join(cleaned_chars)

    text = text.replace("\r\n", "\n").replace("\r", "\n")

    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]

    cleaned_lines: List[str] = []
    blank_count = 0
    for line in lines:
        if not line:
            blank_count += 1
            if blank_count <= 2:
                cleaned_lines.append("")
        else:
            blank_count = 0
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines).strip()


def detect_headings(text: str) -> List[str]:
    """Detects headings or section titles from text."""
    headings = []
    for line in text.split("\n"):
        clean_line = line.strip()
        if not clean_line or len(clean_line) > 100:
            continue
        for pattern in _HEADING_PATTERNS:
            if pattern.match(clean_line):
                headings.append(clean_line)
                break
    return headings


def stem_word(word: str) -> str:
    if _stemmer is not None:
        try:
            return _stemmer.stem(word.strip(_PUNCT).lower())
        except Exception:
            pass
    w = word.strip(_PUNCT).lower()
    for suffix in ("ing", "ies", "es", "ed", "s"):
        if w.endswith(suffix) and len(w) > len(suffix) + 2:
            return w[:-len(suffix)]
    return w


def stem_text(text: str) -> str:
    """Lowercase + stem every whitespace-separated token."""
    return " ".join(stem_word(t) for t in text.split() if t.strip(_PUNCT))


def stem_tokens(text: str) -> set:
    """Stemmed token set."""
    return set(stem_text(text).split())