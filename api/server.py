"""api/server.py — FastAPI backend exposing the FSLDM SDLC pipeline.

Run:    uvicorn api.server:app --reload --port 8000
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from agents.contacts import save_contact
from agents.dev_agent import dev_node
from agents.mapping_agent import _heuristic_mapping
from agents.main import load_schemas
from agents.runs import get_run, list_runs, new_run, update_run
from agents.state import MappingSpec
from agents.testing_agent import testing_node

ROOT = Path(__file__).parent.parent

app = FastAPI(title="FSLDM SDLC API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ─────────────────────────────────────────────────────────────────
class RunRequest(BaseModel):
    dialect: str = "teradata"
    user_email: Optional[str] = "demo@local"


class HitlRequest(BaseModel):
    decision: str  # approve | revise | reject
    feedback: str = ""


class ContactRequest(BaseModel):
    name: str
    email: str
    org: str = ""
    topic: str = "general"
    message: str


# ── Routes ──────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/schemas")
def schemas() -> dict[str, Any]:
    src, tgt, _ = load_schemas()
    return {
        "source": {
            "system": src.get("system"),
            "tables": [
                {"name": t["name"], "columns": len(t.get("columns", [])), "description": t.get("description", "")}
                for t in src.get("tables", [])
            ],
        },
        "target": {
            "system": tgt.get("system"),
            "tables": [
                {"name": t["name"], "grain": t.get("grain", ""), "columns": len(t.get("columns", []))}
                for t in tgt.get("tables", [])
            ],
        },
    }


@app.get("/api/runs")
def runs(limit: int = 100) -> list[dict[str, Any]]:
    return list_runs(limit)


@app.get("/api/runs/{run_id}")
def run_detail(run_id: str) -> dict[str, Any]:
    r = get_run(run_id)
    if not r:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "run not found")
    # Re-hydrate JSON fields for clients
    if r.get("mapping_json"):
        try:
            r["mapping"] = json.loads(r["mapping_json"])
        except Exception:
            pass
    if r.get("artifacts_json"):
        try:
            r["artifacts"] = json.loads(r["artifacts_json"])
        except Exception:
            pass
    if r.get("test_report_json"):
        try:
            r["test_report"] = json.loads(r["test_report_json"])
        except Exception:
            pass
    return r


@app.post("/api/runs")
def create_run(req: RunRequest) -> dict[str, Any]:
    """Stage 1 — generate mapping spec, persist, return run_id + spec."""
    src, tgt, _ = load_schemas()
    spec = _heuristic_mapping(src, tgt, req.dialect)
    rid = new_run(dialect=req.dialect, user_email=req.user_email)
    update_run(rid, stage="hitl", mapping_json=spec.model_dump_json())
    return {"run_id": rid, "mapping": spec.model_dump()}


@app.post("/api/runs/{run_id}/hitl")
def submit_hitl(run_id: str, req: HitlRequest) -> dict[str, Any]:
    """Stage 2 → Stage 3+4 if approved."""
    r = get_run(run_id)
    if not r or not r.get("mapping_json"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "run or mapping not found")
    update_run(run_id, hitl_decision=req.decision, feedback=req.feedback)
    if req.decision != "approve":
        return {"status": req.decision, "run_id": run_id}

    spec = MappingSpec.model_validate_json(r["mapping_json"])
    dev_out = dev_node({"mapping": spec})
    artifacts = dev_out["artifacts"]
    update_run(run_id, stage="testing",
               artifacts_json=json.dumps([a.model_dump() for a in artifacts]))

    test_out = testing_node({"mapping": spec, "artifacts": artifacts})
    report = test_out["test_report"]
    update_run(run_id, stage="complete", test_report_json=report.model_dump_json())

    return {
        "status": "complete",
        "run_id": run_id,
        "artifacts": [a.model_dump() for a in artifacts],
        "test_report": report.model_dump(),
    }


@app.post("/api/contact")
def contact(req: ContactRequest) -> dict[str, Any]:
    if not req.email or "@" not in req.email or not req.message.strip():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "name, email, message required")
    cid = save_contact(req.name, req.email, req.message, req.org, req.topic)
    return {"status": "received", "id": cid}


@app.get("/api/artifacts/{path:path}")
def get_artifact(path: str) -> FileResponse:
    full = ROOT / path
    if not full.exists() or not full.is_file():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "artifact not found")
    # Path traversal guard
    try:
        full.resolve().relative_to(ROOT.resolve())
    except ValueError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "forbidden")
    return FileResponse(full, filename=full.name)
