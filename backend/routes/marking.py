from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.attempt_service import get_attempt
from services.auth import get_authenticated_user
from services.marking_service import mark_attempt

router = APIRouter(tags=["marking"])


class MarkAttemptRequest(BaseModel):
    attemptId: str


@router.post("/markAttempt")
async def mark_attempt_endpoint(
    payload: MarkAttemptRequest,
    current_user: dict = Depends(get_authenticated_user),
) -> dict:
    attempt = get_attempt(payload.attemptId)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found.")

    if current_user["role"] == "student" and attempt.get("studentEmail") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Students can only mark their own submitted attempts.")

    result = mark_attempt(payload.attemptId, current_user["email"])
    return {"status": "marked", "result": result}
