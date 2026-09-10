"""Unit tests for the strict document-only routing functions."""
from graph.routing import (
    route_after_grade,
    route_after_relevance,
    route_after_verification,
    route_query_validation,
)


def test_route_query_validation_valid():
    assert route_query_validation({"is_query_valid": True}) == "retrieval_path"


def test_route_query_validation_invalid():
    assert route_query_validation({"is_query_valid": False}) == "early_exit"


def test_route_after_relevance_sufficient():
    assert route_after_relevance({"relevant_docs": [object()]}) == "grade_evidence"


def test_route_after_relevance_insufficient():
    assert route_after_relevance({"relevant_docs": []}) == "insufficient_evidence"


def test_route_after_grade_sufficient():
    assert route_after_grade({"relevant_docs": [object()]}) == "evidence_sufficient"


def test_route_after_grade_insufficient():
    assert route_after_grade({"relevant_docs": []}) == "insufficient_evidence"


def test_route_after_verification_verified():
    assert route_after_verification({"verification": "YES"}) == "verified"
    assert route_after_verification({"verification": "YES, fully supported."}) == "verified"


def test_route_after_verification_unverified():
    assert route_after_verification({"verification": "NO"}) == "unverified"
    assert route_after_verification({"verification": "PARTIAL"}) == "unverified"
