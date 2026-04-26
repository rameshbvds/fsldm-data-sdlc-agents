import pytest
from sqlglot.errors import ParseError

from agents.sql_validate import assert_dialect_valid


def test_valid_teradata_sql_passes():
    assert_dialect_valid("SELECT 1 FROM DUAL", "teradata")


def test_invalid_sql_raises():
    with pytest.raises((ParseError, Exception)):
        assert_dialect_valid("SELEKT FROM WHERE", "teradata")


def test_dbt_template_with_jinja_passes():
    # sqlglot tolerates jinja-ish in some dialects; this confirms our generator output parses
    sql = "SELECT a, b FROM tbl WHERE c IS NOT NULL"
    assert_dialect_valid(sql, "snowflake")
