"""contacts.py — SQLite persistence for inbound contact requests."""
from __future__ import annotations
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "contacts.db"


def _conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    c = sqlite3.connect(DB_PATH, isolation_level=None)
    c.row_factory = sqlite3.Row
    return c


def init_db() -> None:
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id          TEXT PRIMARY KEY,
                created_at  TEXT NOT NULL,
                name        TEXT,
                email       TEXT,
                org         TEXT,
                topic       TEXT,
                message     TEXT
            )
        """)


def save_contact(name: str, email: str, message: str, org: str = "", topic: str = "general") -> str:
    init_db()
    cid = uuid.uuid4().hex[:12]
    with _conn() as c:
        c.execute(
            "INSERT INTO contacts VALUES (?, ?, ?, ?, ?, ?, ?)",
            (cid, datetime.now(timezone.utc).isoformat(), name, email, org, topic, message),
        )
    return cid


def list_contacts(limit: int = 100) -> list[dict]:
    init_db()
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [dict(r) for r in rows]
