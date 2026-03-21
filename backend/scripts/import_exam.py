from importlib import import_module
from pathlib import Path
import sys

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from services.exam_importer import import_payload


def normalise_module_name(raw_name: str) -> str:
    name = raw_name.strip()
    if not name:
        raise ValueError("Provide an exam payload module name, for example: year7_assessment_task_1")
    if name.endswith(".py"):
        name = name[:-3]
    if name.startswith("backend."):
        name = name.removeprefix("backend.")
    if name.startswith("exam_payloads."):
        return name
    return f"exam_payloads.{name}"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python scripts/import_exam.py <payload_module>")

    module_name = normalise_module_name(sys.argv[1])
    payload = import_module(module_name)
    message = import_payload(
        payload.EXAM_ID,
        payload.EXAM,
        payload.QUESTIONS,
        payload.ANSWER_KEYS,
    )
    print(message)


if __name__ == "__main__":
    main()
