"""
main.py — CLI entry point for FSLDM Deposit SDLC Pipeline
Usage:
    python main.py run --dialect teradata
    python main.py run --dialect teradata --hitl-decision approve
    python main.py run --dialect snowflake --dry-run
"""
from __future__ import annotations
import json
import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax

from agents.graph import graph
from agents.state import SDLCState

app    = typer.Typer(help="FSLDM Deposit Data SDLC Agent")
console = Console()

SCHEMA_DIR = Path(__file__).parent / "schemas"


def load_schemas() -> tuple[dict, dict, list[str]]:
    src  = json.loads((SCHEMA_DIR / "deposit_source.json").read_text())
    tgt  = json.loads((SCHEMA_DIR / "deposit_target.json").read_text())
    rules_path = SCHEMA_DIR / "deposit_rules.json"
    rules = json.loads(rules_path.read_text()) if rules_path.exists() else []
    return src, tgt, rules


@app.command()
def run(
    dialect:       str           = typer.Option("teradata", help="SQL dialect: teradata|snowflake|redshift|bigquery"),
    hitl_decision: Optional[str] = typer.Option(None,       help="Auto HITL decision: approve|revise|reject"),
    thread_id:     str           = typer.Option("deposit-001", help="Pipeline run thread ID"),
    dry_run:       bool          = typer.Option(False,      help="Print plan only, don't invoke LLM"),
):
    """Run the full FSLDM Deposit SDLC pipeline: Mapping → HITL → Dev → Testing."""
    console.print(Panel.fit(
        "[bold cyan]FSLDM Deposit SDLC Agent[/bold cyan]\n"
        f"Dialect: [yellow]{dialect}[/yellow]  |  "
        f"Thread: [yellow]{thread_id}[/yellow]  |  "
        f"HITL: [yellow]{hitl_decision or 'interactive'}[/yellow]",
        border_style="cyan"
    ))

    if dry_run:
        console.print("[yellow]DRY RUN — pipeline plan only. No LLM calls.[/yellow]")
        _print_plan()
        return

    src, tgt, rules = load_schemas()

    initial_state: SDLCState = {
        "request":        f"Generate complete FSLDM deposit pipeline mapping and SQL for all 9 deposit product types using {dialect} dialect.",
        "source_schema":  src,
        "target_schema":  tgt,
        "business_rules": rules,
        "dialect":        dialect,
        "artifacts":      [],
        "errors":         [],
    }

    config = {"configurable": {"thread_id": thread_id}}

    # ── Stage 1: Mapping ──────────────────────────────────────────────────
    console.print("\n[bold blue]▶ Stage 1 — Mapping Agent[/bold blue]")
    with console.status("Generating field mappings for 3 target tables..."):
        for event in graph.stream(initial_state, config, stream_mode="values"):
            if "mapping" in event and event["mapping"]:
                mapping = event["mapping"]
                _print_mapping_summary(mapping)
                break

    # ── HITL gate ─────────────────────────────────────────────────────────
    console.print("\n[bold yellow]⏸ Stage 2 — HITL Review Gate[/bold yellow]")
    if hitl_decision:
        decision = hitl_decision
        console.print(f"  Auto-decision: [green]{decision}[/green]")
    else:
        decision = typer.prompt(
            "Review mapping. Decision",
            default="approve",
            show_choices=True,
            type=typer.Choice(["approve", "revise", "reject"]),
        )
        feedback = ""
        if decision == "revise":
            feedback = typer.prompt("Reviewer feedback")
        graph.update_state(config, {"hitl_decision": decision, "reviewer_feedback": feedback})

    if decision != "approve":
        console.print(f"[yellow]Pipeline {decision}d. Exiting.[/yellow]")
        return

    # ── Stage 3: Dev ──────────────────────────────────────────────────────
    console.print("\n[bold green]▶ Stage 3 — Development Agent[/bold green]")
    with console.status("Generating Teradata SQL + dbt models..."):
        for event in graph.stream(None, config, stream_mode="values"):
            if "artifacts" in event and event["artifacts"]:
                _print_artifact_summary(event["artifacts"])
                break

    # ── Stage 4: Testing ──────────────────────────────────────────────────
    console.print("\n[bold red]▶ Stage 4 — Testing Agent[/bold red]")
    with console.status("Generating GX suites, Soda checks, BTEQ validation SQL..."):
        final = None
        for event in graph.stream(None, config, stream_mode="values"):
            final = event

    if final and final.get("test_report"):
        rpt = final["test_report"]
        console.print(f"  Test suite: [bold]{rpt.suite_name}[/bold]")
        console.print(f"  Expectations: [green]{rpt.total}[/green]")

    # ── Errors ────────────────────────────────────────────────────────────
    if final and final.get("errors"):
        console.print("\n[bold red]Errors / Warnings:[/bold red]")
        for e in final["errors"]:
            console.print(f"  [yellow]⚠ {e}[/yellow]")

    console.print("\n[bold green]✓ Pipeline complete[/bold green]")


def _print_plan():
    table = Table(title="Pipeline Plan", show_header=True)
    table.add_column("Stage"); table.add_column("Agent"); table.add_column("Output")
    table.add_row("1", "Mapping Agent",  "MappingSpec JSON — 3 targets × all columns")
    table.add_row("2", "HITL Gate",      "Human approval / revise / reject")
    table.add_row("3", "Dev Agent",      "Teradata SQL + dbt models + schema.yml per target")
    table.add_row("4", "Testing Agent",  "GX ExpectationSuites + Soda checks + BTEQ validation SQL")
    console.print(table)


def _print_mapping_summary(mapping):
    table = Table(title=f"Mapping: {mapping.mapping_id}", show_header=True)
    table.add_column("Target Table"); table.add_column("Grain"); table.add_column("Fields"); table.add_column("Open Qs")
    for t in mapping.target_tables:
        table.add_row(
            t.target_table,
            t.grain_description,
            str(len(t.field_mappings)),
            str(len(t.open_questions)),
        )
    console.print(table)


def _print_artifact_summary(artifacts):
    table = Table(title="Generated Artifacts", show_header=True)
    table.add_column("Path"); table.add_column("Dialect"); table.add_column("Target")
    for a in artifacts:
        table.add_row(a.path, a.dialect or "—", a.target_table or "—")
    console.print(table)


@app.command()
def show_schema():
    """Print the deposit source and target schemas."""
    src, tgt, _ = load_schemas()
    console.print(Panel(
        Syntax(json.dumps(src, indent=2), "json", theme="monokai"),
        title="Source Schema"
    ))
    console.print(Panel(
        Syntax(json.dumps(tgt, indent=2), "json", theme="monokai"),
        title="Target Schema"
    ))


if __name__ == "__main__":
    app()
