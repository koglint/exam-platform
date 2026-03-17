from typing import Optional

from fastapi import Header, HTTPException
from firebase_admin import auth as firebase_auth

from services.firestore_client import get_firestore_client


def _extract_bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token.")
    return authorization.split(" ", 1)[1]


def get_authenticated_user(authorization: Optional[str] = Header(default=None)) -> dict:
    token = _extract_bearer_token(authorization)

    try:
      decoded_token = firebase_auth.verify_id_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid Firebase token.") from exc

    email = decoded_token.get("email", "").lower()
    db = get_firestore_client()

    teacher = db.collection("teachers").document(email).get()
    if teacher.exists:
        return {"email": email, "role": "teacher", "profile": teacher.to_dict()}

    student = db.collection("students").document(email).get()
    if student.exists:
        return {"email": email, "role": "student", "profile": student.to_dict()}

    raise HTTPException(status_code=403, detail="User is not present in an approved roster.")
