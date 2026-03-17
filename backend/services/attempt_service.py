from services.firestore_client import get_firestore_client


def get_attempt(attempt_id: str) -> dict | None:
    db = get_firestore_client()
    snapshot = db.collection("attempts").document(attempt_id).get()
    if not snapshot.exists:
        return None
    return snapshot.to_dict()


def list_responses(attempt_id: str) -> list[dict]:
    db = get_firestore_client()
    responses = db.collection("attempts").document(attempt_id).collection("responses").stream()
    return [response.to_dict() for response in responses]
