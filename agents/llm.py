"""llm.py — LLM factory.

Choose backend via LLM_PROVIDER env var:
  - openrouter     → OpenRouter API (recommended for cheap demos)
  - anthropic      → Anthropic API directly
  - claude_code    → Local `claude` CLI (free dev mode)
  - ocbc           → OCBC Bank internal LLM platform (gpt-5.1-codex)
  - auto (default) → openrouter > anthropic > claude_code based on which env var is set
"""
from __future__ import annotations
import json
import os
import shutil
import subprocess
from typing import Any

PROD_MODEL_ANTHROPIC = "claude-opus-4-7"
DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-4.6"  # latest sonnet on OpenRouter


# ── Local Claude CLI ────────────────────────────────────────────────────────
class LocalClaudeLLM:
    def __init__(self, timeout: int = 300):
        self.timeout = timeout
        self._exe = shutil.which("claude") or "claude"

    def _run(self, prompt: str, system: str | None = None) -> str:
        cmd = [self._exe, "-p", prompt, "--output-format", "text"]
        if system:
            cmd += ["--append-system-prompt", system]
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=self.timeout,
            encoding="utf-8", errors="replace",
        )
        if proc.returncode != 0:
            raise RuntimeError(f"claude CLI failed: {proc.stderr.strip()}")
        return proc.stdout.strip()

    def invoke(self, prompt: str, system: str | None = None) -> str:
        return self._run(prompt, system)


# ── OpenRouter (OpenAI-compatible) ──────────────────────────────────────────
class OpenRouterLLM:
    """Calls OpenRouter via the openai SDK (OpenRouter exposes an OpenAI-compatible endpoint)."""

    def __init__(self, model: str | None = None, timeout: int = 60):
        self.model = model or os.getenv("OPENROUTER_MODEL", DEFAULT_OPENROUTER_MODEL)
        self.timeout = timeout
        try:
            from openai import OpenAI  # noqa
        except ImportError as e:
            raise RuntimeError("`openai` package required for OpenRouter. pip install openai") from e
        from openai import OpenAI
        self._client = OpenAI(
            api_key=os.environ["OPENROUTER_API_KEY"],
            base_url="https://openrouter.ai/api/v1",
            timeout=timeout,
            default_headers={
                "HTTP-Referer": os.getenv("APP_URL", "https://fsldm-sdlc.local"),
                "X-Title": "FSLDM Data SDLC",
            },
        )

    def invoke(self, prompt: str, system: str | None = None) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        resp = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=2000,
            temperature=0.3,
        )
        return (resp.choices[0].message.content or "").strip()


# ── OCBC Bank Internal LLM Platform ───────────────────────────────────────────
class OCBCLLM:
    """OCBC Bank's internal LLM platform (OpenAI-compatible endpoint)."""

    def __init__(self, model: str | None = None, timeout: int = 60):
        self.model = model or os.getenv("OCBC_MODEL", "gpt-5.1-codex")
        self.timeout = timeout
        self.endpoint = os.getenv(
            "OCBC_ENDPOINT",
            "https://genaiplatform-appgw.dev.c2.ocbc.com/foundryeastus2/openai/v1/responses/",
        )
        self.api_key = os.environ["OCBC_API_KEY"]

        try:
            import requests  # noqa
        except ImportError as e:
            raise RuntimeError("`requests` package required for OCBC LLM. pip install requests") from e
        import requests
        self._session = requests.Session()
        self._session.verify = False  # OCBC uses internal certs

    def invoke(self, prompt: str, system: str | None = None) -> str:
        import requests
        import urllib3

        # Suppress SSL warnings for internal OCBC endpoint
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key,
        }

        # OCBC format: model, input (prompt), instructions (system), max_output_tokens
        payload = {
            "model": self.model,
            "input": prompt,
            "instructions": system or "You are a helpful assistant.",
            "max_output_tokens": 2000,
        }

        resp = self._session.post(
            self.endpoint,
            json=payload,
            headers=headers,
            timeout=self.timeout,
        )
        resp.raise_for_status()

        data = resp.json()
        # OCBC returns { "output": "...", "model": "...", "usage": {...} }
        return (data.get("output") or "").strip()


# ── Factory ─────────────────────────────────────────────────────────────────
def get_llm() -> Any:
    provider = os.getenv("LLM_PROVIDER", "auto").lower().strip()

    if provider == "openrouter":
        return OpenRouterLLM()
    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=PROD_MODEL_ANTHROPIC, max_tokens=8000)
    if provider == "claude_code":
        return LocalClaudeLLM()
    if provider == "ocbc":
        return OCBCLLM()

    # auto: pick based on which key is present
    if os.getenv("OPENROUTER_API_KEY"):
        return OpenRouterLLM()
    if os.getenv("ANTHROPIC_API_KEY"):
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=PROD_MODEL_ANTHROPIC, max_tokens=8000)
    if os.getenv("OCBC_API_KEY"):
        return OCBCLLM()
    return LocalClaudeLLM()


def is_local_cli(llm: Any) -> bool:
    return isinstance(llm, LocalClaudeLLM)
