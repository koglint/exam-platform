from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

from services.config import settings

_app = None


def get_firestore_client():
    global _app
    if _app is None:
        if settings.firebase_credentials_path and Path(settings.firebase_credentials_path).exists():
            credential = credentials.Certificate(settings.firebase_credentials_path)
            _app = firebase_admin.initialize_app(
                credential,
                {
                    "projectId": settings.firebase_project_id,
                    "storageBucket": settings.firebase_storage_bucket,
                },
            )
        elif (
            settings.firebase_project_id
            and settings.firebase_client_email
            and settings.firebase_private_key
        ):
            credential = credentials.Certificate(
                {
                    "type": "service_account",
                    "project_id": settings.firebase_project_id,
                    "client_email": settings.firebase_client_email,
                    "private_key": settings.firebase_private_key.replace("\\n", "\n"),
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            )
            _app = firebase_admin.initialize_app(
                credential,
                {
                    "projectId": settings.firebase_project_id,
                    "storageBucket": settings.firebase_storage_bucket,
                },
            )
        else:
            _app = firebase_admin.initialize_app(
                options={
                    "projectId": settings.firebase_project_id,
                    "storageBucket": settings.firebase_storage_bucket,
                }
            )

    return firestore.client()
