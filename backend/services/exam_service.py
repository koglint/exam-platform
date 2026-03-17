from services.firestore_client import get_firestore_client


def get_exam(exam_id: str) -> dict | None:
    db = get_firestore_client()
    snapshot = db.collection("exams").document(exam_id).get()
    if not snapshot.exists:
        return None
    return snapshot.to_dict()


def list_questions(exam_id: str) -> list[dict]:
    db = get_firestore_client()
    docs = (
        db.collection("exams")
        .document(exam_id)
        .collection("questions")
        .order_by("order")
        .stream()
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


def get_answer_key(exam_id: str) -> dict[str, int]:
    db = get_firestore_client()
    docs = (
        db.collection("exams")
        .document(exam_id)
        .collection("answerKeys")
        .stream()
    )
    return {
        doc.id: doc.to_dict().get("correctOption")
        for doc in docs
    }
