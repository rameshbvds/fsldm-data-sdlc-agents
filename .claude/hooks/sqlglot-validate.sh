#!/usr/bin/env bash
# After Edit/Write, if a sql_*/*.gen.sql file changed, validate it with sqlglot.
set -u
INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); print((d.get('tool_input') or {}).get('file_path',''))" 2>/dev/null || true)
case "$FILE" in
  *sql_teradata*.gen.sql|*sql_dbt_gen*.sql|*sql_bteq*.gen.sql) ;;
  *) exit 0 ;;
esac
PY=".venv/Scripts/python.exe"
[ -x "$PY" ] || PY=".venv/bin/python"
[ -x "$PY" ] || PY="python"
DIALECT="teradata"
[[ "$FILE" == *sql_dbt_gen* ]] && DIALECT="snowflake"
[[ "$FILE" == *sql_bteq* ]] && DIALECT="teradata"
"$PY" - "$FILE" "$DIALECT" <<'EOF' || exit 2
import sys, sqlglot
fp, dialect = sys.argv[1], sys.argv[2]
try:
    sql = open(fp, encoding="utf-8").read()
    for stmt in sqlglot.parse(sql, dialect=dialect):
        pass
    print(f"sqlglot OK: {fp} [{dialect}]")
except Exception as e:
    print(f"SQLGLOT FAIL {fp} [{dialect}]: {e}", file=sys.stderr)
    sys.exit(2)
EOF
exit 0
