"""Thin, swappable wrapper around the local LLM (Ollama).

Everything that needs the model calls `generate_json` — a single choke point.
To swap Ollama for something else later (e.g. OpenRouter), only this file changes.

We force JSON output so extraction/generation returns something we can parse,
and use a low temperature because these are extraction tasks, not creative ones.
"""
import json

import httpx

from app.config import settings

##

from google import genai


client = genai.Client(api_key=settings.gemini_api_key)

# Ollama defaults a model to a few thousand tokens of context whatever the model
# can actually do, and silently drops what does not fit. Every prompt we send is
# long on purpose — the whole knowledge base, a whole resume section, a whole
# document — so an unset window means the model quietly stops seeing the start
# of its own instructions. Set it once, here, for every call.
##CONTEXT_TOKENS = 16384


def generate_json(
    system: str,
    prompt: str,
    timeout: float | None = 120.0,
    max_tokens: int = 1200,
) -> dict:

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=f"{system}\n\n{prompt}",
        config={
            "response_mime_type": "application/json",
            "max_output_tokens": max_tokens,
            "temperature": 0.2,
        },
    )

    return json.loads(response.text)

def generate_text(
    system: str,
    prompt: str,
    timeout: float | None = 120.0,
    max_tokens: int = 1200,
) -> str:
    """Generate plain text using Gemini."""

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=f"{system}\n\n{prompt}",
        config={
            "temperature": 0.1,
            "max_output_tokens": max_tokens,
        },
    )

    return response.text
