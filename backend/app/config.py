"""Central configuration. Reads from environment / .env via pydantic-settings.

Keeping every tunable here (DB URL, model name, embedding dimension) means
swapping the embedding model or database is a config change, not a code change.

The defaults are the local development setup — Postgres from docker-compose on
5432, Ollama installed natively on 11434 — so a fresh clone runs with no .env at
all. A .env only exists to override something.
"""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Absolute, not "..env": the backend is started from backend/ but .env lives at
# the repo root, and a relative env_file is resolved against the *current
# working directory*. Left relative, the root .env is silently never read.
REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=REPO_ROOT / ".env", extra="ignore")

    database_url: str = "postgresql+psycopg://jobsearch:jobsearch@localhost:5432/jobsearch"
    # A native Ollama install (the documented setup) owns 11434. The optional
    # docker-compose Ollama publishes 11435 so the two can coexist.
    ollama_url: str = "http://localhost:11434"
    # Local LLM for extraction (and later resume generation). Small + fast by
    # default; the review step catches any mistakes. For higher quality set
    # OLLAMA_MODEL=llama3.1:8b (larger download, slower on CPU).
    ollama_model: str = "llama3.2:3b"

    # ONE embedding model for everything that gets compared (KB + jobs).
    # EMBEDDING_DIM must match the model's output size.
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_dim: int = 384


# Single shared settings instance.
settings = Settings()
