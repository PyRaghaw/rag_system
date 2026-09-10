"""
Builds and compiles the Strict Document-Only LangGraph workflow:

  START
    │
    ▼
  validate_query ──(early_exit)──────────────────────────► persist_turn ──► END
    │ (retrieval_path)
    ▼
  enterprise_retrieve
    │
    ▼
  is_relevant (Hard Numeric Relevance Gate)
    │
    ├─(insufficient_evidence)──► insufficient_evidence ──► persist_turn ──► END
    │
    ▼ (grade_evidence)
  grade_relevance (LLM Answer-Fit Gate)
    │
    ├─(insufficient_evidence)──► insufficient_evidence ──► persist_turn ──► END
    │
    ▼ (evidence_sufficient)
  generate_from_context
    │
    ▼
  verify_answer
    │
    ├─(unverified)─────────────► insufficient_evidence ──► persist_turn ──► END
    │
    ▼ (verified)
  attach_sources
    │
    ▼
  persist_turn
    │
    ▼
   END
"""
from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from graph import nodes
from graph.routing import (
    route_after_grade,
    route_after_relevance,
    route_after_verification,
    route_query_validation,
)
from graph.state import State


def build_graph():
    g = StateGraph(State)

    g.add_node("validate_query", nodes.validate_query)
    g.add_node("enterprise_retrieve", nodes.enterprise_retrieve)
    g.add_node("is_relevant", nodes.is_relevant)
    g.add_node("grade_relevance", nodes.grade_relevance)
    g.add_node("insufficient_evidence", nodes.insufficient_evidence_node)
    g.add_node("generate_from_context", nodes.generate_from_context)
    g.add_node("verify_answer", nodes.verify_answer)
    g.add_node("attach_sources", nodes.attach_sources)
    g.add_node("persist_turn", nodes.persist_turn)

    # Entry point
    g.add_edge(START, "validate_query")

    # Branch 1: Query Validation
    g.add_conditional_edges(
        "validate_query",
        route_query_validation,
        {
            "early_exit": "persist_turn",
            "retrieval_path": "enterprise_retrieve",
        },
    )

    # Retrieval to hard numeric relevance gate
    g.add_edge("enterprise_retrieve", "is_relevant")

    # Branch 2: Hard Numeric Relevance Gate -> LLM Answer-Fit Gate
    g.add_conditional_edges(
        "is_relevant",
        route_after_relevance,
        {
            "grade_evidence": "grade_relevance",
            "insufficient_evidence": "insufficient_evidence",
        },
    )

    # Branch 3: LLM Relevance Grading (zero-hallucination guard)
    g.add_conditional_edges(
        "grade_relevance",
        route_after_grade,
        {
            "evidence_sufficient": "generate_from_context",
            "insufficient_evidence": "insufficient_evidence",
        },
    )

    # Generation to Verification
    g.add_edge("generate_from_context", "verify_answer")

    # Branch 4: Verification (Fail-Closed)
    g.add_conditional_edges(
        "verify_answer",
        route_after_verification,
        {
            "verified": "attach_sources",
            "unverified": "insufficient_evidence",
        },
    )

    # Terminal transitions
    g.add_edge("attach_sources", "persist_turn")
    g.add_edge("insufficient_evidence", "persist_turn")
    g.add_edge("persist_turn", END)

    return g.compile()


@lru_cache
def get_app():
    return build_graph()
