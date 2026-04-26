"""sql_validate.py — sqlglot-based SQL validation utility + CLI.

Handles three SQL flavors written by this repo:
- pure Teradata SQL (`sql_teradata/*.sql`)
- BTEQ scripts (`sql_bteq/*.sql`)         → strips `.LOGON`/`.LOGOFF`/`.QUIT` directives
- dbt models   (`sql_dbt*/*.sql`)         → strips `{{ ... }}` and `{% ... %}` jinja
"""
from __future__ import annotations
import argparse
import re
import sys
from pathlib import Path

import sqlglot
from sqlglot.errors import ParseError


DIALECT_BY_DIR = {
    "sql_teradata": "teradata",
    "sql_dbt_gen": "snowflake",
    "sql_dbt": "snowflake",
    "sql_bteq": "teradata",
}


_JINJA_RE = re.compile(r"\{\{[^}]*\}\}|\{%[^%]*%\}")
_BTEQ_DIRECTIVE_RE = re.compile(r"^\s*\.[A-Z]+.*$", re.MULTILINE)


def _strip_for(p: Path, sql: str) -> str:
    parts = set(p.parts)
    if "sql_bteq" in parts:
        sql = _BTEQ_DIRECTIVE_RE.sub("", sql)
    if "sql_dbt_gen" in parts or "sql_dbt" in parts:
        # Drop standalone jinja lines (config, set, etc.); replace inline jinja with a stub.
        kept: list[str] = []
        for line in sql.splitlines():
            stripped = _JINJA_RE.sub("", line).strip()
            if not stripped:
                # line was only jinja or whitespace — skip
                continue
            kept.append(_JINJA_RE.sub("REF_PLACEHOLDER", line))
        sql = "\n".join(kept)
    return sql


def assert_dialect_valid(sql: str, dialect: str) -> None:
    """Raise ParseError if SQL does not parse for `dialect`."""
    for stmt in sqlglot.parse(sql, dialect=dialect):
        if stmt is None:
            continue


def _detect_dialect(p: Path) -> str:
    for key, d in DIALECT_BY_DIR.items():
        if key in p.parts:
            return d
    return "teradata"


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate generated SQL files via sqlglot.")
    ap.add_argument("--all", action="store_true", help="Walk sql_*/ directories")
    ap.add_argument("paths", nargs="*", type=Path)
    args = ap.parse_args()

    targets: list[Path] = list(args.paths)
    if args.all:
        root = Path(__file__).parent.parent
        for d in ("sql_teradata", "sql_dbt_gen", "sql_dbt", "sql_bteq"):
            targets.extend((root / d).glob("*.sql"))

    if not targets:
        print("no SQL files to validate")
        return 0

    failures: list[str] = []
    for p in targets:
        if not p.exists():
            failures.append(f"{p}: missing")
            continue
        dialect = _detect_dialect(p)
        try:
            sql = _strip_for(p, p.read_text(encoding="utf-8"))
            assert_dialect_valid(sql, dialect)
            print(f"OK    {p} [{dialect}]")
        except ParseError as e:
            failures.append(f"{p} [{dialect}]: {e}")
            print(f"FAIL  {p} [{dialect}]: {e}", file=sys.stderr)

    if failures:
        print(f"\n{len(failures)} file(s) failed validation", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
