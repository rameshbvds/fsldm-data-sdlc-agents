"""config.py — Pydantic-settings runtime config."""
from __future__ import annotations
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


Dialect = Literal[
    "teradata", "snowflake", "redshift", "bigquery", "databricks", "postgres", "duckdb"
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_root: Path = Field(default_factory=lambda: Path(__file__).parent.parent)
    schema_dir: Path = Field(default=None)  # type: ignore[assignment]

    llm_provider: Literal["claude_code", "anthropic", "auto"] = "auto"
    anthropic_model: str = "claude-opus-4-7"
    claude_cli_timeout_s: int = 300

    dialect_default: Dialect = "teradata"
    dry_run: bool = False
    log_level: str = "INFO"
    log_format: Literal["console", "json"] = "console"

    def __init__(self, **kw):  # type: ignore[no-untyped-def]
        super().__init__(**kw)
        if self.schema_dir is None:
            object.__setattr__(self, "schema_dir", self.project_root / "schemas")


settings = Settings()
