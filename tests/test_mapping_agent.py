from agents.mapping_agent import _heuristic_mapping
from agents.state import MappingSpec


def test_heuristic_mapping_covers_all_target_tables(src_schema, tgt_schema):
    spec = _heuristic_mapping(src_schema, tgt_schema, "teradata")
    assert isinstance(spec, MappingSpec)
    target_names = {t["name"] for t in tgt_schema["tables"]}
    spec_names = {t.target_table for t in spec.target_tables}
    assert target_names == spec_names


def test_heuristic_mapping_no_fabricated_high_confidence(src_schema, tgt_schema):
    spec = _heuristic_mapping(src_schema, tgt_schema, "teradata")
    for t in spec.target_tables:
        for fm in t.field_mappings:
            if fm.transform_note == "unmapped":
                assert fm.confidence <= 0.4
                assert fm.open_question is not None


def test_heuristic_mapping_dialect_propagates(src_schema, tgt_schema):
    spec = _heuristic_mapping(src_schema, tgt_schema, "snowflake")
    assert spec.dialect == "snowflake"
    assert "SNOWFLAKE" in spec.mapping_id
