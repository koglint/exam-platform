from pathlib import Path
import sys

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from exam_payloads.year7_assessment_task_1 import ANSWER_KEYS, EXAM, EXAM_ID, QUESTIONS
from services.exam_importer import import_payload


def import_exam() -> None:
    print(import_payload(EXAM_ID, EXAM, QUESTIONS, ANSWER_KEYS))


if __name__ == "__main__":
    import_exam()
