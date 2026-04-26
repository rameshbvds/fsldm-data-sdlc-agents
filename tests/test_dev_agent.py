from pathlib import Path

from agents.dev_agent import dev_node
from agents.mapping_agent import _heuristic_mapping
from agents.sql_validate import assert_dialect_valid


def test_dev_agent_writes_artifacts(src_schema, tgt_schema, tmp_path, monkeypatch):
    spec = _heuristic_mapping(src_schema, tgt_schema, "teradata")
    out = dev_node({"mapping": spec})
    artifacts = out["artifacts"]
    assert any(a.kind == "sql" for a in artifacts)
    assert any(a.kind == "dbt" for a in artifacts)
    assert any(a.kind == "yaml" for a in artifacts)


def test_generated_teradata_sql_parses(src_schema, tgt_schema):
    spec = _heuristic_mapping(src_schema, tgt_schema, "teradata")
    out = dev_node({"mapping": spec})
    root = Path(__file__).parent.parent
    for a in out["artifacts"]:
        if a.kind != "sql":
            continue
        sql = (root / a.path).read_text(encoding="utf-8")
        # Should parse — even template SQL with /* TODO */ comments is valid
        assert_dialect_valid(sql, a.dialect or "teradata")
