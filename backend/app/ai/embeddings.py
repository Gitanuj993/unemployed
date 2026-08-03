"""
Embedding service using Google's Gemini Embedding API.
"""

from google import genai

from app.config import settings

client = genai.Client(api_key=settings.gemini_api_key)


def embed_passage(text: str) -> list[float]:
    """Embed a stored document."""
    response = client.models.embed_content(
        model=settings.embedding_model,
        contents=text,
    )

    return response.embeddings[0].values


def embed_query(text: str) -> list[float]:
    """Embed a query."""
    response = client.models.embed_content(
        model=settings.embedding_model,
        contents=text,
    )

    return response.embeddings[0].values  
    
