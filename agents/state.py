"""state.py — Shared state + Pydantic models for FSLDM Deposit SDLC pipeline."""
from __future__ import annotations
from typing import Optional, TypedDict
from pydantic import BaseModel, Field


class FieldMapping(BaseModel):
    target_column: str
    source_expr: str = Field(description="Source-side SQL expression or column reference")
    source_tables: list[str] = Field(default_factory=list)
    transform_note: str = ""
    confidence: float = Field(ge=0.0, le=1.0, default=0.9)
    open_question: Optional[str] = None


class TargetTable(BaseModel):
    target_table: str
    grain_description: str
    field_mappings: list[FieldMapping] = Field(default_factory=list)
    open_questions: list[str] = Field(default_factory=list)


class MappingSpec(BaseModel):
    mapping_id: str
    dialect: str
    target_tables: list[TargetTable] = Field(default_factory=list)
    notes: str = ""


class Artifact(BaseModel):
    path: str
    kind: str  # sql | dbt | yaml | json
    dialect: Optional[str] = None
    target_table: Optional[str] = None
    bytes_written: int = 0


class TestReport(BaseModel):
    suite_name: str
    total: int = 0
    expectations: list[str] = Field(default_factory=list)
    soda_checks: int = 0
    bteq_statements: int = 0


class SDLCState(TypedDict, total=False):
    request: str
    source_schema: dict
    target_schema: dict
    business_rules: list
    dialect: str
    mapping: Optional[MappingSpec]
    hitl_decision: Optional[str]
    reviewer_feedback: Optional[str]
    artifacts: list[Artifact]
    test_report: Optional[TestReport]
    errors: list[str]
    next: Optional[str]
