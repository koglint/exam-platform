import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "replace-with-project-id")
    firebase_storage_bucket: str = os.getenv("FIREBASE_STORAGE_BUCKET", "replace-with-project-id.appspot.com")
    firebase_credentials_path: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5500")
    reports_output_dir: str = os.getenv("REPORTS_OUTPUT_DIR", "./generated-reports")


settings = Settings()
