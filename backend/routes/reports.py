from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.auth import get_authenticated_user
from services.report_service import generate_exam_reports

router = APIRouter(tags=["reports"])


class GenerateReportsRequest(BaseModel):
    sessionId: str


@router.post("/generateExamReports")
async def generate_reports_endpoint(
    payload: GenerateReportsRequest,
    current_user: dict = Depends(get_authenticated_user),
) -> dict:
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required.")

    report_summary = generate_exam_reports(payload.sessionId, current_user["email"])
    return {"status": "queued", "reports": report_summary}
