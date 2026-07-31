"""FastAPI application entrypoint.

Sprint 1: a minimal app with a health check that confirms the API is up and can
reach Postgres. Routers (kb, jobs, matches, ...) get mounted here as we build them.
"""
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api import (
    applications,
    companies,
    jobs,
    kb,
    matches,
    outreach,
    pipeline,
    preferences,
    profile,
    projects,
    resumes,
    setup,
    templates,
)
from app.db.session import get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    pipeline.release_stale_runs()
    yield


app = FastAPI(title="AI Career Assistant", version="0.1.0", lifespan=lifespan)

# The Next.js dev server runs on :3000 and calls this API on :8000. Both
# hostnames are allowed because "localhost" and "127.0.0.1" are different
# origins to a browser even though they reach the same machine - whichever
# one you type into the address bar has to be in this list, or the
# CORSMiddleware itself returns 400 on every request before it reaches a route.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kb.router)
app.include_router(jobs.router)
app.include_router(matches.router)
app.include_router(resumes.router)
app.include_router(applications.router)
app.include_router(preferences.router)
app.include_router(outreach.router)
app.include_router(projects.router)
app.include_router(companies.router)
app.include_router(pipeline.router)
app.include_router(setup.router)
app.include_router(templates.router)
app.include_router(profile.router)


@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    """Liveness + DB connectivity check."""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": "reachable"}
