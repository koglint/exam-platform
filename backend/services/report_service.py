from pathlib import Path

from reports.pdf_builder import build_student_report_placeholder, build_teacher_report_placeholder
from services.config import settings
from services.firestore_client import get_firestore_client


def generate_exam_reports(session_id: str, requested_by: str) -> dict:
    db = get_firestore_client()
    attempts = list(
        db.collection("attempts")
        .where("sessionId", "==", session_id)
        .stream()
    )

    output_dir = Path(settings.reports_output_dir) / session_id
    output_dir.mkdir(parents=True, exist_ok=True)

    student_reports = []
    student_scores = []

    for attempt_doc in attempts:
        attempt = attempt_doc.to_dict()
        student_path = output_dir / f"{attempt_doc.id}-student-report.pdf"
        build_student_report_placeholder(student_path, attempt)
        student_reports.append(str(student_path))

        marking = attempt.get("marking", {})
        student_scores.append(
            {
                "studentEmail": attempt.get("studentEmail"),
                "studentName": attempt.get("studentName"),
                "score": marking.get("score"),
                "total": marking.get("total"),
            }
        )

    teacher_path = output_dir / "teacher-report.pdf"
    build_teacher_report_placeholder(teacher_path, session_id, student_scores, requested_by)

    return {
        "sessionId": session_id,
        "studentReportCount": len(student_reports),
        "teacherReport": str(teacher_path),
        "studentReports": student_reports,
    }
