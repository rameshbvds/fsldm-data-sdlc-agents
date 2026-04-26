from agents.mapping_agent import _heuristic_mapping
from agents.testing_agent import testing_node


def test_testing_node_emits_report(src_schema, tgt_schema):
    spec = _heuristic_mapping(src_schema, tgt_schema, "teradata")
    out = testing_node({"mapping": spec, "artifacts": []})
    rpt = out["test_report"]
    assert rpt.suite_name == "fsldm_deposit_suite"
    assert rpt.total > 0
    assert rpt.bteq_statements > 0


def test_testing_node_includes_ind_in_set_checks(src_schema, tgt_schema):
    spec = _heuristic_mapping(src_schema, tgt_schema, "teradata")
    out = testing_node({"mapping": spec, "artifacts": []})
    names = " ".join(out["test_report"].expectations)
    assert ".in_set" in names
