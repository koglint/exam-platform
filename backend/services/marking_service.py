from datetime import datetime, timezone

from marking.engine import calculate_result
from services.attempt_service import get_attempt, list_responses
from services.exam_service import get_answer_key, list_questions
from services.firestore_client import get_firestore_client


def mark_attempt(attempt_id: str, marker_email: str) -> dict:
    db = get_firestore_client()
    attempt = get_attempt(attempt_id)
    if not attempt:
        raise ValueError("Attempt not found.")

    if not attempt.get("locked"):
        raise ValueError("Attempt must be locked before marking.")

    exam_id = attempt["examId"]
    questions = list_questions(exam_id)
    answer_key = get_answer_key(exam_id)
    responses = list_responses(attempt_id)
    result = calculate_result(questions, responses, answer_key)

    db.collection("attempts").document(attempt_id).set(
        {
            "marking": {
                "score": result["score"],
                "total": result["total"],
                "questionResults": result["question_results"],
                "markedAt": datetime.now(timezone.utc).isoformat(),
                "markedBy": marker_email,
            }
        },
        merge=True,
    )

    return result
