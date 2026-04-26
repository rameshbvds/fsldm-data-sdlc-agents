"""runs.py — SQLite persistence for pipeline runs (UAT history)."""
from __future__ import annotations
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

DB_PATH = Path(__file__).parent.parent / "data" / "runs.db"


def _conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    c = sqlite3.connect(DB_PATH, isolation_level=None)
    c.row_factory = sqlite3.Row
    return c


def init_db() -> None:
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS runs (
                run_id        TEXT PRIMARY KEY,
                created_at    TEXT NOT NULL,
                user_email    TEXT,
                dialect       TEXT NOT NULL,
                stage         TEXT NOT NULL,
                hitl_decision TEXT,
                feedback      TEXT,
                mapping_json  TEXT,
                artifacts_json TEXT,
                test_report_json TEXT,
                error         TEXT
            )
        """)


def new_run(dialect: str, user_email: Optional[str] = None) -> str:
    init_db()
    rid = uuid.uuid4().hex[:12]
    with _conn() as c:
        c.execute(
            "INSERT INTO runs (run_id, created_at, user_email, dialect, stage) VALUES (?, ?, ?, ?, ?)",
            (rid, datetime.now(timezone.utc).isoformat(), user_email, dialect, "mapping"),
        )
    return rid


def update_run(run_id: str, **fields: Any) -> None:
    if not fields:
        return
    init_db()
    cols = ", ".join(f"{k} = ?" for k in fields)
    vals = [json.dumps(v) if isinstance(v, (dict, list)) else v for v in fields.values()]
    with _conn() as c:
        c.execute(f"UPDATE runs SET {cols} WHERE run_id = ?", [*vals, run_id])


def get_run(run_id: str) -> Optional[dict]:
    init_db()
    with _conn() as c:
        row = c.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,)).fetchone()
    return dict(row) if row else None


def list_runs(limit: int = 50) -> list[dict]:
    init_db()
    with _conn() as c:
        rows = c.execute(
            "SELECT run_id, created_at, user_email, dialect, stage, hitl_decision FROM runs "
            "ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]
