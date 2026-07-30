"""Central configuration. Reads from environment / .env via pydantic-settings.

Keeping every tunable here (DB URL, model name, embedding dimension) means
swapping the embedding model or database is a config change, not a code change.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load from a .env file at the repo root if present.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://jobsearch:jobsearch@localhost:5432/jobsearch"
    # 11435 = our docker-compose Ollama (11434 is left to any native install).
    ollama_url: str = "http://localhost:11435"
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
