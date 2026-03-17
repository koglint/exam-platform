from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def build_student_report_placeholder(output_path: Path, attempt: dict) -> None:
    pdf = canvas.Canvas(str(output_path), pagesize=A4)
    pdf.setTitle("Student Exam Report")

    y = 800
    pdf.drawString(72, y, "Student Exam Report")
    y -= 30
    pdf.drawString(72, y, f"Student: {attempt.get('studentName', 'Unknown student')}")
    y -= 20
    pdf.drawString(72, y, f"Attempt: {attempt.get('attemptId', 'N/A')}")
    y -= 20
    pdf.drawString(72, y, "This is a placeholder report scaffold.")
    y -= 20
    pdf.drawString(72, y, "Populate question-by-question feedback and topic summaries here.")
    pdf.save()


def build_teacher_report_placeholder(
    output_path: Path,
    session_id: str,
    student_scores: list[dict],
    requested_by: str,
) -> None:
    pdf = canvas.Canvas(str(output_path), pagesize=A4)
    pdf.setTitle("Teacher Exam Report")

    y = 800
    pdf.drawString(72, y, "Teacher Exam Report")
    y -= 30
    pdf.drawString(72, y, f"Session: {session_id}")
    y -= 20
    pdf.drawString(72, y, f"Requested by: {requested_by}")
    y -= 20
    pdf.drawString(72, y, f"Student records included: {len(student_scores)}")
    y -= 20
    pdf.drawString(72, y, "Extend this report with class averages, distractor analysis, and item difficulty.")
    pdf.save()
