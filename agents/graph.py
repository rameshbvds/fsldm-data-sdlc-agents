"""
graph.py — LangGraph pipeline for FSLDM Deposit SDLC
Stages: Mapping → HITL → Dev → Testing → END
Supports multi-target, multi-product deposit pipeline.
"""
from __future__ import annotations
from typing import Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from agents.state import SDLCState
from agents.mapping_agent import mapping_node
from agents.dev_agent import dev_node
from agents.testing_agent import testing_node


# ── HITL gate ─────────────────────────────────────────────────────────────
def hitl_node(state: SDLCState) -> dict:
    """
    Human-in-the-loop review gate.
    In production this blocks until a reviewer sets hitl_decision.
    In demo mode, auto-approves unless reviewer_feedback is provided.
    """
    decision = state.get("hitl_decision", "approve")
    return {"hitl_decision": decision, "next": decision}


def route_after_hitl(state: SDLCState) -> Literal["dev", "mapping", "end"]:
    decision = state.get("hitl_decision", "approve")
    if decision == "approve":
        return "dev"
    elif decision == "revise":
        return "mapping"
    else:
        return "end"


def route_after_mapping(state: SDLCState) -> Literal["hitl", "end"]:
    if state.get("errors") and not state.get("mapping"):
        return "end"
    return "hitl"


def route_after_dev(state: SDLCState) -> Literal["testing", "end"]:
    if state.get("artifacts"):
        return "testing"
    return "end"


# ── Build graph ────────────────────────────────────────────────────────────
def build_graph(checkpointer=None) -> StateGraph:
    builder = StateGraph(SDLCState)

    builder.add_node("mapping",  mapping_node)
    builder.add_node("hitl",     hitl_node)
    builder.add_node("dev",      dev_node)
    builder.add_node("testing",  testing_node)

    builder.set_entry_point("mapping")

    builder.add_conditional_edges("mapping", route_after_mapping, {
        "hitl": "hitl",
        "end":  END,
    })

    builder.add_conditional_edges("hitl", route_after_hitl, {
        "dev":     "dev",
        "mapping": "mapping",
        "end":     END,
    })

    builder.add_conditional_edges("dev", route_after_dev, {
        "testing": "testing",
        "end":     END,
    })

    builder.add_edge("testing", END)

    memory = checkpointer or MemorySaver()
    return builder.compile(
        checkpointer=memory,
        interrupt_before=["hitl"],   # pause here for human review
    )


graph = build_graph()
