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
        else:
            _app = firebase_admin.initialize_app(
                options={
                    "projectId": settings.firebase_project_id,
                    "storageBucket": settings.firebase_storage_bucket,
                }
            )

    return firestore.client()
