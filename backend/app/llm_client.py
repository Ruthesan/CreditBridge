"""
Thin wrapper around the Anthropic client with a deterministic mock mode.

Why this exists: the intake and advisor agents call an LLM. For local
development, CI, and the eval harness, we don't want every run to depend on
a live API key or to produce nondeterministic text that breaks reproducible
testing. LLM_MODE=mock (the default with no ANTHROPIC_API_KEY set) routes
calls to hand-written deterministic stand-ins that mimic real output shape.
Set LLM_MODE=live and ANTHROPIC_API_KEY to use the real Claude API.
"""
import json
from app.config import settings

_client = None


def _get_client():
    global _client
    if _client is None:
        import anthropic
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


def call_claude_json(system_prompt: str, user_content: str, max_tokens: int = 2000) -> dict:
    """Calls Claude and parses the response as JSON. Raises ValueError on bad JSON."""
    client = _get_client()
    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )
    text = "".join(block.text for block in response.content if block.type == "text")
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM did not return valid JSON: {e}\nRaw: {text[:500]}")


def is_mock_mode() -> bool:
    return settings.LLM_MODE == "mock"
