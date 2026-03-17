import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


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
