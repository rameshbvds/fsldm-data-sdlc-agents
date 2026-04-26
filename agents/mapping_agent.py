"""mapping_agent.py — Stage 1: produce a MappingSpec from source/target schemas."""
from __future__ import annotations
import json

from agents.state import SDLCState, MappingSpec, TargetTable, FieldMapping
from agents.llm import get_llm, is_local_cli, LocalClaudeLLM


SYSTEM_PROMPT = """You are a senior data engineer specializing in FSLDM (Financial Services Logical Data Model)
deposit data warehousing. You produce precise, dialect-aware column-level mappings from a banking ODS
to an EDW fact-table layer. You are conservative: when a target column has no clear source, you flag it
as an open question rather than inventing logic."""


def _heuristic_mapping(src: dict, tgt: dict, dialect: str) -> MappingSpec:
    """Deterministic fallback — names that match get a 1-to-1 mapping; rest become open questions."""
    src_cols: dict[str, str] = {}  # col_name -> table_name
    for t in src.get("tables", []):
        for c in t.get("columns", []):
            src_cols.setdefault(c["name"].upper(), t["name"])

    target_tables: list[TargetTable] = []
    for t in tgt.get("tables", []):
        fms: list[FieldMapping] = []
        opens: list[str] = []
        for c in t.get("columns", []):
            name = c["name"]
            if name.upper() in src_cols:
                src_t = src_cols[name.upper()]
                fms.append(FieldMapping(
                    target_column=name,
                    source_expr=f"{src_t}.{name}",
                    source_tables=[src_t],
                    transform_note="direct",
                    confidence=0.95,
                ))
            elif name.endswith("_IND"):
                fms.append(FieldMapping(
                    target_column=name,
                    source_expr=f"CASE WHEN 1=0 THEN 'Y' ELSE 'N' END /* TODO: derive {name} */",
                    source_tables=[],
                    transform_note="derived flag — needs business rule",
                    confidence=0.4,
                    open_question=f"Confirm derivation rule for {name}",
                ))
                opens.append(f"Derivation rule for {name}")
            elif name in ("ETL_CRET_TS",):
                fms.append(FieldMapping(
                    target_column=name,
                    source_expr="CURRENT_TIMESTAMP(6)",
                    transform_note="ETL audit",
                    confidence=1.0,
                ))
            elif name == "SRC_SYS_CD":
                fms.append(FieldMapping(
                    target_column=name,
                    source_expr=f"'{src.get('system','SRC')}'",
                    transform_note="literal",
                    confidence=1.0,
                ))
            else:
                fms.append(FieldMapping(
                    target_column=name,
                    source_expr=f"/* TODO: source for {name} */ NULL",
                    transform_note="unmapped",
                    confidence=0.2,
                    open_question=f"No direct source found for {name}",
                ))
                opens.append(f"Find source for {name}")
        target_tables.append(TargetTable(
            target_table=t["name"],
            grain_description=t.get("grain", t.get("description", "")),
            field_mappings=fms,
            open_questions=opens[:5],
        ))

    return MappingSpec(
        mapping_id=f"FSLDM-DEPOSIT-{dialect.upper()}-001",
        dialect=dialect,
        target_tables=target_tables,
        notes="Heuristic baseline mapping. Refine via LLM or HITL.",
    )


def mapping_node(state: SDLCState) -> dict:
    src = state["source_schema"]
    tgt = state["target_schema"]
    dialect = state.get("dialect", "teradata")

    # Always start from heuristic — it's fast and deterministic
    spec = _heuristic_mapping(src, tgt, dialect)

    # Optional LLM enrichment
    try:
        llm = get_llm()
        if is_local_cli(llm):
            assert isinstance(llm, LocalClaudeLLM)
            note = llm.invoke(
                f"Briefly (≤80 words) review this FSLDM deposit mapping for dialect={dialect}. "
                f"Target tables: {[tt.target_table for tt in spec.target_tables]}. "
                f"Total open questions: {sum(len(tt.open_questions) for tt in spec.target_tables)}. "
                "Highlight the single biggest risk.",
                system=SYSTEM_PROMPT,
            )
            spec.notes = (spec.notes + "\n\nClaude review: " + note).strip()
    except Exception as e:
        return {"mapping": spec, "errors": state.get("errors", []) + [f"LLM enrich skipped: {e}"]}

    return {"mapping": spec}
