from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health import router as health_router
from routes.marking import router as marking_router
from routes.reports import router as reports_router
from services.config import settings


def build_allowed_origins() -> list[str]:
    origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8001",
        settings.frontend_origin,
    }

    if settings.additional_cors_origins:
        origins.update(
            origin.strip()
            for origin in settings.additional_cors_origins.split(",")
            if origin.strip()
        )

    return sorted(origins)

app = FastAPI(
    title="Exam Platform API",
    description="Backend API for secure marking and report generation.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(marking_router)
app.include_router(reports_router)
