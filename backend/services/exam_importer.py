from datetime import datetime, timezone

from firebase_admin import firestore

from services.firestore_client import get_firestore_client


def validate_payload(exam_id: str, exam: dict, questions: list[dict], answer_keys: dict[str, int]) -> None:
    if not exam_id:
        raise ValueError("EXAM_ID is required.")
    if not exam.get("name"):
        raise ValueError("EXAM.name is required.")
    if not questions:
        raise ValueError("QUESTIONS must contain at least one question.")

    seen_ids = set()
    seen_orders = set()

    for question in questions:
        question_id = question.get("id")
        order = question.get("order")
        options = question.get("options") or []

        if not question_id:
            raise ValueError("Every question must have an id.")
        if question_id in seen_ids:
            raise ValueError(f"Duplicate question id: {question_id}")
        if order is None:
            raise ValueError(f"Question {question_id} is missing an order.")
        if order in seen_orders:
            raise ValueError(f"Duplicate question order: {order}")
        if len(options) < 2:
            raise ValueError(f"Question {question_id} must have at least two options.")
        if question_id not in answer_keys:
            raise ValueError(f"Question {question_id} is missing an answer key.")

        correct_option = answer_keys[question_id]
        if not isinstance(correct_option, int):
            raise ValueError(f"Answer key for {question_id} must be an integer.")
        if correct_option < 0 or correct_option >= len(options):
            raise ValueError(f"Answer key for {question_id} is out of range.")

        seen_ids.add(question_id)
        seen_orders.add(order)

    if len(answer_keys) != len(questions):
        extra_keys = sorted(set(answer_keys) - seen_ids)
        if extra_keys:
            raise ValueError(f"Answer keys exist for unknown questions: {', '.join(extra_keys)}")

    question_count = exam.get("questionCount")
    if question_count is not None and question_count != len(questions):
        raise ValueError(
            f"EXAM.questionCount ({question_count}) does not match number of questions ({len(questions)})."
        )


def import_payload(exam_id: str, exam: dict, questions: list[dict], answer_keys: dict[str, int]) -> str:
    validate_payload(exam_id, exam, questions, answer_keys)

    db = get_firestore_client()
    timestamp = datetime.now(timezone.utc).isoformat()
    exam_ref = db.collection("exams").document(exam_id)

    batch = db.batch()
    batch.set(
        exam_ref,
        {
            **exam,
            "questionCount": len(questions),
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "importedAt": timestamp,
            "importedBy": "codex-script",
        },
        merge=True,
    )

    for question in questions:
        question_id = question["id"]
        batch.set(
            exam_ref.collection("questions").document(question_id),
            {
                **question,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
        )
        batch.set(
            exam_ref.collection("answerKeys").document(question_id),
            {
                "correctOption": answer_keys[question_id],
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
        )

    batch.commit()
    return f"Imported {exam_id} with {len(questions)} questions."
