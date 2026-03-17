from fastapi import APIRouter
from pydantic import BaseModel

from services.report_service import generate_exam_reports

router = APIRouter(tags=["reports"])


class GenerateReportsRequest(BaseModel):
    sessionId: str


@router.post("/generateExamReports")
async def generate_reports_endpoint(
    payload: GenerateReportsRequest,
) -> dict:
    report_summary = generate_exam_reports(payload.sessionId, "prototype-admin")
    return {"status": "queued", "reports": report_summary}
