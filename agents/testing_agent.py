"""testing_agent.py — Stage 4: emit GX expectations, Soda checks, BTEQ validation SQL."""
from __future__ import annotations
import json
from pathlib import Path

from agents.state import SDLCState, MappingSpec, TestReport, Artifact

ROOT = Path(__file__).parent.parent


def _gx_suite(spec: MappingSpec) -> tuple[dict, list[str]]:
    expectations: list[dict] = []
    names: list[str] = []
    for t in spec.target_tables:
        for fm in t.field_mappings:
            col = fm.target_column
            if "_ID" in col or col.endswith("_DT") or col.endswith("_AMT") or col.endswith("_CD"):
                expectations.append({
                    "expectation_type": "expect_column_values_to_not_be_null",
                    "kwargs": {"column": col},
                    "meta": {"target_table": t.target_table},
                })
                names.append(f"{t.target_table}.{col}.not_null")
            if col.endswith("_IND"):
                expectations.append({
                    "expectation_type": "expect_column_values_to_be_in_set",
                    "kwargs": {"column": col, "value_set": ["Y", "N"]},
                    "meta": {"target_table": t.target_table},
                })
                names.append(f"{t.target_table}.{col}.in_set")
    suite = {
        "expectation_suite_name": "fsldm_deposit_suite",
        "expectations": expectations,
        "meta": {"mapping_id": spec.mapping_id, "dialect": spec.dialect},
    }
    return suite, names


def _soda_yaml(spec: MappingSpec) -> tuple[str, int]:
    lines: list[str] = []
    count = 0
    for t in spec.target_tables:
        lines.append(f"checks for {t.target_table}:")
        lines.append("  - row_count > 0")
        count += 1
        for fm in t.field_mappings:
            if fm.target_column.endswith("_AMT"):
                lines.append(f"  - missing_count({fm.target_column}) = 0:")
                lines.append(f"      name: {t.target_table}.{fm.target_column}.no_nulls")
                count += 1
        lines.append("")
    return "\n".join(lines) + "\n", count


def _bteq_sql(spec: MappingSpec) -> tuple[str, int]:
    stmts: list[str] = [".LOGON ${TD_HOST}/${TD_USER},${TD_PASS};", ""]
    n = 0
    for t in spec.target_tables:
        stmts.append(
            f"SELECT '{t.target_table}.row_count' AS check_nm, COUNT(*) AS val "
            f"FROM EDW_FSLDM.{t.target_table};"
        )
        n += 1
        for fm in t.field_mappings[:3]:
            stmts.append(
                f"SELECT '{t.target_table}.{fm.target_column}.nulls' AS check_nm, "
                f"COUNT(*) AS val FROM EDW_FSLDM.{t.target_table} WHERE {fm.target_column} IS NULL;"
            )
            n += 1
        stmts.append("")
    stmts.append(".LOGOFF;\n.QUIT;")
    return "\n".join(stmts), n


def testing_node(state: SDLCState) -> dict:
    spec: MappingSpec = state.get("mapping")  # type: ignore
    if not spec:
        return {"errors": state.get("errors", []) + ["testing_node: missing mapping"]}

    artifacts: list[Artifact] = list(state.get("artifacts", []))

    gx_dir = ROOT / "gx"; gx_dir.mkdir(exist_ok=True)
    soda_dir = ROOT / "soda"; soda_dir.mkdir(exist_ok=True)
    bteq_dir = ROOT / "sql_bteq"; bteq_dir.mkdir(exist_ok=True)

    suite, names = _gx_suite(spec)
    p_gx = gx_dir / "deposit_expectations.gen.json"
    p_gx.write_text(json.dumps(suite, indent=2), encoding="utf-8")
    artifacts.append(Artifact(path=str(p_gx.relative_to(ROOT)), kind="json", bytes_written=p_gx.stat().st_size))

    soda, soda_n = _soda_yaml(spec)
    p_soda = soda_dir / "deposit_checks.gen.yml"
    p_soda.write_text(soda, encoding="utf-8")
    artifacts.append(Artifact(path=str(p_soda.relative_to(ROOT)), kind="yaml", bytes_written=len(soda)))

    bteq, bteq_n = _bteq_sql(spec)
    p_bteq = bteq_dir / "deposit_validate_all.gen.sql"
    p_bteq.write_text(bteq, encoding="utf-8")
    artifacts.append(Artifact(path=str(p_bteq.relative_to(ROOT)), kind="sql", bytes_written=len(bteq)))

    report = TestReport(
        suite_name="fsldm_deposit_suite",
        total=len(suite["expectations"]),
        expectations=names[:20],
        soda_checks=soda_n,
        bteq_statements=bteq_n,
    )

    return {"artifacts": artifacts, "test_report": report}
