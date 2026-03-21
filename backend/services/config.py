import os
from dataclasses import dataclass
from pathlib import Path

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    def load_dotenv(path=None, *_args, **_kwargs):
        if not path:
            return False

        env_path = Path(path)
        if not env_path.exists():
            return False

        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)
        return True

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[1]
REPO_ROOT = CURRENT_FILE.parents[2]

load_dotenv(REPO_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "replace-with-project-id")
    firebase_storage_bucket: str = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    firebase_credentials_path: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    firebase_client_email: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    firebase_private_key: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
    bootstrap_teacher_emails: str = os.getenv(
        "BOOTSTRAP_TEACHER_EMAILS",
        "troy.koglin1@education.nsw.gov.au",
    )
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5500")
    additional_cors_origins: str = os.getenv("ADDITIONAL_CORS_ORIGINS", "")
    reports_output_dir: str = os.getenv("REPORTS_OUTPUT_DIR", "./generated-reports")


settings = Settings()
