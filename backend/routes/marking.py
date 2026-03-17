from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.attempt_service import get_attempt
from services.marking_service import mark_attempt

router = APIRouter(tags=["marking"])


class MarkAttemptRequest(BaseModel):
    attemptId: str


@router.post("/markAttempt")
async def mark_attempt_endpoint(
    payload: MarkAttemptRequest,
) -> dict:
    attempt = get_attempt(payload.attemptId)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found.")

    result = mark_attempt(payload.attemptId, "prototype-client")
    return {"status": "marked", "result": result}
