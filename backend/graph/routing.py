"""
Pure routing functions for the Strict Document-Only LangGraph workflow.
"""
from graph.state import State


def route_query_validation(state: State) -> str:
    """Checks if the query passed validation."""
    if not state.get("is_query_valid", True):
        return "early_exit"
    return "retrieval_path"


def route_after_relevance(state: State) -> str:
    """Hard numeric relevance gate: only proceeds to LLM grading if evidence exists."""
    return "grade_evidence" if state.get("relevant_docs") else "insufficient_evidence"


def route_after_grade(state: State) -> str:
    """LLM grading gate: only generates from chunks that actually answer the question."""
    return "evidence_sufficient" if state.get("relevant_docs") else "insufficient_evidence"


def route_after_verification(state: State) -> str:
    """Groundedness verification: fail-closed if answer is not fully supported."""
    verification = state.get("verification", "").upper()
    if "YES" in verification:
        return "verified"
    return "unverified"
