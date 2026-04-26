"""app.py — FSLDM Data SDLC Pipeline · Enterprise UAT Console.

A premium-styled Streamlit app designed for C-suite + analyst + engineer audiences.
"""
from __future__ import annotations
import json
import os
import time
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from agents.dev_agent import dev_node
from agents.mapping_agent import _heuristic_mapping
from agents.main import load_schemas
from agents.runs import get_run, list_runs, new_run, update_run
from agents.state import MappingSpec
from agents.testing_agent import testing_node

ROOT = Path(__file__).parent

st.set_page_config(
    page_title="FSLDM · Data SDLC Console",
    page_icon="◆",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={"About": "FSLDM Data SDLC Pipeline · Enterprise MVP"},
)

# ═══════════════════════════════════════════════════════════════════════════════
# DESIGN SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════
NAVY = "#0B1426"
NAVY_2 = "#152238"
SLATE = "#1E293B"
GOLD = "#C9A961"
GOLD_SOFT = "#E8D9A8"
SUCCESS = "#10B981"
WARN = "#F59E0B"
DANGER = "#EF4444"
TEXT = "#E2E8F0"
TEXT_DIM = "#94A3B8"
BORDER = "#1F2A3D"

CSS = f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

html, body, [class*="css"], [class*="st-"] {{
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}}

.stApp {{
  background: linear-gradient(135deg, {NAVY} 0%, {NAVY_2} 100%);
  color: {TEXT};
}}

[data-testid="stHeader"] {{ background: transparent; }}

[data-testid="stSidebar"] {{
  background: {NAVY} !important;
  border-right: 1px solid {BORDER};
}}
[data-testid="stSidebar"] * {{ color: {TEXT}; }}

h1, h2, h3, h4, h5 {{
  font-family: 'Inter', sans-serif !important;
  letter-spacing: -0.02em;
  color: {TEXT} !important;
}}
h1 {{ font-weight: 700 !important; font-size: 2.5rem !important; }}
h2 {{ font-weight: 600 !important; }}
h3 {{ font-weight: 600 !important; color: {GOLD_SOFT} !important; }}

p, span, label, div {{ color: {TEXT}; }}

code, pre, .stCodeBlock {{
  font-family: 'JetBrains Mono', monospace !important;
  background: {SLATE} !important;
  color: {GOLD_SOFT} !important;
  border-radius: 6px;
}}

.stButton > button {{
  background: linear-gradient(135deg, {GOLD} 0%, #B8954A 100%);
  color: {NAVY};
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.5rem;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(201, 169, 97, 0.2);
}}
.stButton > button:hover {{
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(201, 169, 97, 0.35);
}}
.stButton > button:disabled {{
  background: {SLATE};
  color: {TEXT_DIM};
  box-shadow: none;
}}

.stSelectbox > div > div, .stTextInput > div > div, .stTextArea textarea {{
  background: {SLATE} !important;
  color: {TEXT} !important;
  border: 1px solid {BORDER} !important;
  border-radius: 8px !important;
}}

[data-testid="stMetric"] {{
  background: {SLATE};
  border: 1px solid {BORDER};
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  transition: all 0.2s ease;
}}
[data-testid="stMetric"]:hover {{
  border-color: {GOLD};
  transform: translateY(-2px);
}}
[data-testid="stMetricLabel"] {{
  color: {TEXT_DIM} !important;
  font-size: 0.8rem !important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}}
[data-testid="stMetricValue"] {{
  color: {GOLD_SOFT} !important;
  font-size: 2rem !important;
  font-weight: 700 !important;
}}

[data-testid="stExpander"] {{
  background: {SLATE};
  border: 1px solid {BORDER};
  border-radius: 12px;
  margin: 0.5rem 0;
}}
[data-testid="stExpander"] summary {{
  font-weight: 500;
  color: {TEXT} !important;
}}

.stDataFrame {{
  border: 1px solid {BORDER};
  border-radius: 12px;
  overflow: hidden;
}}

.stAlert {{ border-radius: 10px; }}

[data-testid="stTabs"] button {{
  background: transparent !important;
  color: {TEXT_DIM} !important;
  font-weight: 500;
  border-bottom: 2px solid transparent !important;
}}
[data-testid="stTabs"] button[aria-selected="true"] {{
  color: {GOLD} !important;
  border-bottom-color: {GOLD} !important;
}}

/* Hero card */
.hero {{
  background: linear-gradient(135deg, {SLATE} 0%, {NAVY_2} 100%);
  border: 1px solid {BORDER};
  border-radius: 16px;
  padding: 2rem 2.5rem;
  margin: 0.5rem 0 1.5rem;
  position: relative;
  overflow: hidden;
}}
.hero::before {{
  content: "";
  position: absolute;
  top: 0; right: 0;
  width: 200px; height: 100%;
  background: radial-gradient(circle, {GOLD}22 0%, transparent 70%);
  pointer-events: none;
}}
.hero-eyebrow {{
  color: {GOLD};
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}}
.hero-title {{
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: {TEXT};
  margin-bottom: 0.5rem;
}}
.hero-sub {{
  color: {TEXT_DIM};
  font-size: 1rem;
  max-width: 60ch;
}}

/* Stat cards */
.stat-grid {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}}
.stat-card {{
  background: {SLATE};
  border: 1px solid {BORDER};
  border-radius: 12px;
  padding: 1.4rem;
  border-left: 4px solid {GOLD};
}}
.stat-label {{
  color: {TEXT_DIM};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  margin-bottom: 0.4rem;
}}
.stat-value {{
  color: {TEXT};
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}}
.stat-delta {{
  color: {SUCCESS};
  font-size: 0.85rem;
  margin-top: 0.3rem;
}}

/* Stage timeline */
.stages {{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin: 1.5rem 0;
}}
.stage {{
  background: {SLATE};
  border: 1px solid {BORDER};
  border-radius: 10px;
  padding: 1rem;
  position: relative;
}}
.stage.active {{
  border-color: {GOLD};
  background: linear-gradient(135deg, {SLATE} 0%, {NAVY_2} 100%);
}}
.stage.done {{ border-color: {SUCCESS}; }}
.stage-num {{
  font-family: 'JetBrains Mono', monospace;
  color: {GOLD};
  font-size: 0.75rem;
  font-weight: 600;
}}
.stage-name {{
  color: {TEXT};
  font-weight: 600;
  margin: 0.4rem 0 0.2rem;
}}
.stage-status {{
  color: {TEXT_DIM};
  font-size: 0.8rem;
}}
.stage.done .stage-status {{ color: {SUCCESS}; }}
.stage.active .stage-status {{ color: {GOLD}; }}

/* Pills */
.pill {{
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-right: 0.4rem;
}}
.pill-success {{ background: {SUCCESS}33; color: {SUCCESS}; border: 1px solid {SUCCESS}66; }}
.pill-warn {{ background: {WARN}33; color: {WARN}; border: 1px solid {WARN}66; }}
.pill-danger {{ background: {DANGER}33; color: {DANGER}; border: 1px solid {DANGER}66; }}
.pill-gold {{ background: {GOLD}33; color: {GOLD}; border: 1px solid {GOLD}66; }}
.pill-slate {{ background: {BORDER}; color: {TEXT_DIM}; border: 1px solid {BORDER}; }}

/* Footer */
.footer {{
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid {BORDER};
  color: {TEXT_DIM};
  font-size: 0.8rem;
  text-align: center;
}}

/* Brand block in sidebar */
.brand {{
  padding: 1.2rem 0.5rem 0.5rem;
  border-bottom: 1px solid {BORDER};
  margin-bottom: 1rem;
}}
.brand-logo {{
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: {TEXT};
}}
.brand-logo span {{ color: {GOLD}; }}
.brand-sub {{
  color: {TEXT_DIM};
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 0.2rem;
}}

/* Hide streamlit branding noise */
#MainMenu {{ visibility: hidden; }}
footer {{ visibility: hidden; }}
header[data-testid="stHeader"] {{ height: 0; }}
</style>
"""

PLOTLY_TEMPLATE = dict(
    layout=dict(
        plot_bgcolor=SLATE,
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(color=TEXT, family="Inter, sans-serif"),
        xaxis=dict(gridcolor=BORDER, zerolinecolor=BORDER),
        yaxis=dict(gridcolor=BORDER, zerolinecolor=BORDER),
        colorway=[GOLD, SUCCESS, "#60A5FA", WARN, DANGER, "#A78BFA"],
        margin=dict(l=20, r=20, t=40, b=20),
    )
)

st.markdown(CSS, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════
def _check_auth() -> str:
    expected_pw = os.getenv("UAT_PASSWORD", "")
    if not expected_pw:
        return st.session_state.get("user_email", "demo@local")
    if st.session_state.get("authed"):
        return st.session_state["user_email"]

    st.markdown(CSS, unsafe_allow_html=True)
    _, mid, _ = st.columns([1, 2, 1])
    with mid:
        st.markdown(
            f"""
            <div class="hero" style="text-align:center;">
              <div class="hero-eyebrow">Enterprise Console</div>
              <div class="hero-title">FSLDM <span style="color:{GOLD}">·</span> Data SDLC</div>
              <div class="hero-sub" style="margin:auto;">Sign in with your work email to access the UAT console.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        with st.form("login"):
            email = st.text_input("Work email", placeholder="you@bank.com")
            pw = st.text_input("Access code", type="password")
            if st.form_submit_button("Continue →"):
                if pw == expected_pw and email:
                    st.session_state.authed = True
                    st.session_state.user_email = email
                    st.rerun()
                else:
                    st.error("Invalid credentials.")
    st.stop()


user_email = _check_auth()


# ═══════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown(
        f"""
        <div class="brand">
          <div class="brand-logo">FSLDM<span>·</span>SDLC</div>
          <div class="brand-sub">Data Pipeline Console</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    page = st.radio(
        "Navigation",
        ["◆ Dashboard", "▶ Run Pipeline", "📜 History", "ℹ About"],
        label_visibility="collapsed",
    )
    st.markdown("---")
    st.markdown(
        f"""
        <div style="font-size:0.8rem; color:{TEXT_DIM}; line-height:1.6;">
          <div><span style="color:{GOLD};">●</span> Service: <b style="color:{TEXT};">healthy</b></div>
          <div>Build: <code style="font-size:0.7rem;">v0.1.0</code></div>
          <div>User: <code style="font-size:0.7rem;">{user_email}</code></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════
def hero(eyebrow: str, title: str, sub: str):
    st.markdown(
        f"""
        <div class="hero">
          <div class="hero-eyebrow">{eyebrow}</div>
          <div class="hero-title">{title}</div>
          <div class="hero-sub">{sub}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def stat_grid(items: list[tuple[str, str, str | None]]):
    cards = "".join(
        f"""<div class="stat-card">
          <div class="stat-label">{label}</div>
          <div class="stat-value">{value}</div>
          {f'<div class="stat-delta">{delta}</div>' if delta else ''}
        </div>"""
        for label, value, delta in items
    )
    st.markdown(f'<div class="stat-grid">{cards}</div>', unsafe_allow_html=True)


def stage_timeline(active_idx: int, done_idx: int = -1):
    stages = [
        ("01", "Mapping", "Field-level lineage"),
        ("02", "HITL", "Human review gate"),
        ("03", "Develop", "SQL + dbt emit"),
        ("04", "Test", "GX + Soda + BTEQ"),
    ]
    cells = []
    for i, (num, name, desc) in enumerate(stages):
        cls = "stage"
        status = desc
        if i <= done_idx:
            cls += " done"
            status = "✓ complete"
        elif i == active_idx:
            cls += " active"
            status = "● in progress"
        cells.append(
            f'<div class="{cls}"><div class="stage-num">STAGE {num}</div>'
            f'<div class="stage-name">{name}</div>'
            f'<div class="stage-status">{status}</div></div>'
        )
    st.markdown(f'<div class="stages">{"".join(cells)}</div>', unsafe_allow_html=True)


def confidence_pill(c: float) -> str:
    if c >= 0.85:
        return f'<span class="pill pill-success">HIGH · {c:.2f}</span>'
    if c >= 0.5:
        return f'<span class="pill pill-warn">MID · {c:.2f}</span>'
    return f'<span class="pill pill-danger">LOW · {c:.2f}</span>'


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: ABOUT
# ═══════════════════════════════════════════════════════════════════════════════
if page == "ℹ About":
    hero(
        "Platform Overview",
        "Built for the modern data warehouse migration",
        "An AI-orchestrated SDLC pipeline that converts banking ODS schemas into FSLDM-compliant "
        "fact tables, dbt models, and data-quality test suites in seconds — with a human-in-the-loop "
        "review gate to keep lineage decisions accountable.",
    )

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("### Pipeline Stages")
        st.markdown(
            f"""
            <div style="background:{SLATE}; border-radius:12px; padding:1.5rem; border:1px solid {BORDER};">
              <p><b style="color:{GOLD};">01 — Mapping Agent</b><br/>
              <span style="color:{TEXT_DIM};">Heuristic + LLM-reviewed field lineage. Never invents sources.</span></p>
              <p><b style="color:{GOLD};">02 — HITL Review Gate</b><br/>
              <span style="color:{TEXT_DIM};">Human approves, revises, or rejects before SQL is emitted.</span></p>
              <p><b style="color:{GOLD};">03 — Development Agent</b><br/>
              <span style="color:{TEXT_DIM};">Dialect-correct Teradata SQL + dbt models, sqlglot-validated.</span></p>
              <p style="margin:0;"><b style="color:{GOLD};">04 — Testing Agent</b><br/>
              <span style="color:{TEXT_DIM};">Great Expectations · Soda · BTEQ — auto-generated.</span></p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown("### Supported Dialects")
        df = pd.DataFrame(
            [
                ("Teradata", "Production", "Current DWH"),
                ("Snowflake", "Ready", "AWS migration"),
                ("Redshift", "Ready", "AWS alternative"),
                ("BigQuery", "Ready", "GCP"),
                ("Databricks", "Ready", "Lakehouse"),
                ("Postgres", "Ready", "OSS"),
                ("DuckDB", "Ready", "Local testing"),
            ],
            columns=["Dialect", "Status", "Use case"],
        )
        st.dataframe(df, hide_index=True, width="stretch")
    st.stop()


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════
if page == "◆ Dashboard":
    hero(
        "Executive Dashboard",
        "Compress 2 weeks of analyst work into 30 seconds",
        "Multi-agent orchestration for FSLDM-compliant data warehouse migration. "
        "Every column lineage decision is auditable, explainable, and human-approved.",
    )

    runs = list_runs(500)
    n_runs = len(runs)
    n_complete = sum(1 for r in runs if r.get("hitl_decision") == "approve")
    n_revise = sum(1 for r in runs if r.get("hitl_decision") == "revise")
    dialects = {r["dialect"] for r in runs}

    stat_grid(
        [
            ("Total Runs", str(n_runs), None),
            ("Approved", str(n_complete), f"{(n_complete/max(n_runs,1)*100):.0f}% rate"),
            ("Revise Requests", str(n_revise), None),
            ("Dialects Tested", str(len(dialects)), ", ".join(sorted(dialects)) if dialects else "—"),
        ]
    )

    if runs:
        df = pd.DataFrame(runs)
        df["created_at"] = pd.to_datetime(df["created_at"])
        df["date"] = df["created_at"].dt.date

        c1, c2 = st.columns([2, 1])
        with c1:
            st.markdown("### Run Volume")
            daily = df.groupby("date").size().reset_index(name="runs")
            fig = px.bar(daily, x="date", y="runs", template=PLOTLY_TEMPLATE)
            fig.update_traces(marker_color=GOLD)
            fig.update_layout(height=280, showlegend=False)
            st.plotly_chart(fig, width="stretch")
        with c2:
            st.markdown("### Decision Mix")
            decisions = df["hitl_decision"].fillna("pending").value_counts().reset_index()
            decisions.columns = ["decision", "count"]
            fig = px.pie(
                decisions,
                names="decision",
                values="count",
                template=PLOTLY_TEMPLATE,
                hole=0.5,
                color_discrete_sequence=[SUCCESS, WARN, DANGER, TEXT_DIM],
            )
            fig.update_layout(height=280, showlegend=True, legend=dict(orientation="h", y=-0.1))
            st.plotly_chart(fig, width="stretch")

        st.markdown("### Recent Activity")
        st.dataframe(
            df[["created_at", "user_email", "dialect", "stage", "hitl_decision"]].head(10),
            hide_index=True,
            width="stretch",
        )
    else:
        st.info("No runs yet. Head to **Run Pipeline** to generate your first one.")
    st.stop()


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: HISTORY
# ═══════════════════════════════════════════════════════════════════════════════
if page == "📜 History":
    hero("Audit Trail", "Run history", "Every pipeline execution is persisted with reviewer feedback for compliance.")
    rows = list_runs(200)
    if not rows:
        st.info("No runs yet.")
        st.stop()
    df = pd.DataFrame(rows)
    st.dataframe(df, width="stretch", hide_index=True)
    rid = st.text_input("Inspect run by ID", placeholder="e.g. 16e35ddbbc4b")
    if rid:
        run = get_run(rid)
        if run:
            st.json(run, expanded=False)
        else:
            st.warning("Run not found.")
    st.stop()


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE: RUN PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════
hero(
    "New Pipeline Run",
    "Generate FSLDM artifacts",
    "Pick a target warehouse dialect, run the mapping stage, review the field-level lineage, "
    "and approve to emit production SQL + data-quality tests.",
)

# Stage timeline (computed live)
stage_idx = 0
done_idx = -1
if st.session_state.get("run_id"):
    run = get_run(st.session_state.run_id) or {}
    stage = run.get("stage", "mapping")
    stage_map = {"mapping": 0, "hitl": 1, "testing": 2, "complete": 3}
    stage_idx = stage_map.get(stage, 0)
    done_idx = stage_idx - 1 if stage != "mapping" else -1

stage_timeline(stage_idx, done_idx)

# Run controls
ctl1, ctl2, ctl3 = st.columns([2, 1, 1])
with ctl1:
    dialect = st.selectbox(
        "Target dialect",
        ["teradata", "snowflake", "redshift", "bigquery", "databricks", "postgres", "duckdb"],
        help="The warehouse SQL dialect for emitted artifacts.",
    )
with ctl2:
    st.markdown(
        f'<div style="padding-top:1.7rem;"><span class="pill pill-gold">SOURCE TABLES · 13</span></div>',
        unsafe_allow_html=True,
    )
with ctl3:
    st.markdown(
        f'<div style="padding-top:1.7rem;"><span class="pill pill-gold">TARGET FACTS · 3</span></div>',
        unsafe_allow_html=True,
    )

if "run_id" not in st.session_state:
    st.session_state.run_id = None

run_btn = st.button("▶ Run Mapping Stage", type="primary")

if run_btn:
    progress = st.progress(0, text="Loading source schema…")
    time.sleep(0.2); progress.progress(20, text="Loading target schema…")
    src, tgt, _rules = load_schemas()
    time.sleep(0.2); progress.progress(50, text="Generating heuristic mapping…")
    spec = _heuristic_mapping(src, tgt, dialect)
    time.sleep(0.2); progress.progress(85, text="Persisting run…")
    rid = new_run(dialect=dialect, user_email=user_email)
    update_run(rid, stage="hitl", mapping_json=spec.model_dump_json())
    progress.progress(100, text="✓ Mapping stage complete")
    st.session_state.run_id = rid
    st.session_state.spec = spec
    time.sleep(0.4)
    st.rerun()

# ── Results display ─────────────────────────────────────────────────────────
if st.session_state.run_id:
    spec: MappingSpec | None = st.session_state.get("spec")
    if spec is None:
        run = get_run(st.session_state.run_id)
        if run and run.get("mapping_json"):
            spec = MappingSpec.model_validate_json(run["mapping_json"])

    if spec:
        # Aggregate stats
        all_fms = [fm for tt in spec.target_tables for fm in tt.field_mappings]
        n_fields = len(all_fms)
        n_high = sum(1 for fm in all_fms if fm.confidence >= 0.85)
        n_open = sum(1 for tt in spec.target_tables for _ in tt.open_questions)
        avg_conf = sum(fm.confidence for fm in all_fms) / max(n_fields, 1)

        st.markdown("### Mapping Overview")
        st.caption(f"Run: `{st.session_state.run_id}` · Spec: `{spec.mapping_id}` · Dialect: `{spec.dialect}`")

        stat_grid(
            [
                ("Total Mappings", f"{n_fields}", f"{len(spec.target_tables)} target tables"),
                ("High Confidence", f"{n_high}", f"{n_high/n_fields*100:.0f}% of fields"),
                ("Open Questions", f"{n_open}", "flagged for review"),
                ("Avg Confidence", f"{avg_conf:.2f}", None),
            ]
        )

        # Confidence chart
        c1, c2 = st.columns([2, 1])
        with c1:
            st.markdown("### Confidence Distribution")
            conf_df = pd.DataFrame(
                {
                    "table": [tt.target_table for tt in spec.target_tables for _ in tt.field_mappings],
                    "confidence": [fm.confidence for tt in spec.target_tables for fm in tt.field_mappings],
                }
            )
            fig = px.histogram(
                conf_df, x="confidence", color="table", nbins=20, template=PLOTLY_TEMPLATE,
                color_discrete_sequence=[GOLD, SUCCESS, "#60A5FA"],
            )
            fig.update_layout(height=320, bargap=0.1, legend=dict(orientation="h", y=-0.2))
            st.plotly_chart(fig, width="stretch")
        with c2:
            st.markdown("### Per-Table Coverage")
            tbl_df = pd.DataFrame(
                [
                    {"table": tt.target_table, "fields": len(tt.field_mappings),
                     "open_qs": len(tt.open_questions)}
                    for tt in spec.target_tables
                ]
            )
            fig = go.Figure()
            fig.add_trace(go.Bar(name="Fields", x=tbl_df["table"], y=tbl_df["fields"], marker_color=GOLD))
            fig.add_trace(go.Bar(name="Open Qs", x=tbl_df["table"], y=tbl_df["open_qs"], marker_color=DANGER))
            fig.update_layout(barmode="group", template=PLOTLY_TEMPLATE, height=320,
                              legend=dict(orientation="h", y=-0.2))
            st.plotly_chart(fig, width="stretch")

        # Per-table detail
        st.markdown("### Field-Level Lineage")
        for tt in spec.target_tables:
            high_n = sum(1 for fm in tt.field_mappings if fm.confidence >= 0.85)
            mid_n = sum(1 for fm in tt.field_mappings if 0.5 <= fm.confidence < 0.85)
            low_n = sum(1 for fm in tt.field_mappings if fm.confidence < 0.5)
            badge = (
                f'<span class="pill pill-success">{high_n} high</span>'
                f'<span class="pill pill-warn">{mid_n} mid</span>'
                f'<span class="pill pill-danger">{low_n} low</span>'
            )
            with st.expander(f"**{tt.target_table}**  ·  {tt.grain_description}", expanded=False):
                st.markdown(badge, unsafe_allow_html=True)
                df = pd.DataFrame(
                    [
                        {
                            "Target Column": fm.target_column,
                            "Source Expression": fm.source_expr,
                            "Confidence": fm.confidence,
                            "Note": fm.transform_note,
                            "Open Question": fm.open_question or "",
                        }
                        for fm in tt.field_mappings
                    ]
                )
                st.dataframe(
                    df,
                    width="stretch",
                    hide_index=True,
                    column_config={
                        "Confidence": st.column_config.ProgressColumn(
                            "Confidence", format="%.2f", min_value=0.0, max_value=1.0
                        ),
                    },
                )
                if tt.open_questions:
                    st.warning("**Open questions for this table:**\n\n- " + "\n- ".join(tt.open_questions))

        # ── HITL ─────────────────────────────────────────────────────────────
        st.markdown("### Human-in-the-Loop Review")
        st.markdown(
            f'<div style="color:{TEXT_DIM}; margin-bottom:1rem;">'
            "Approve to emit production artifacts. Revise to send back with feedback. "
            "Reject to terminate this run.</div>",
            unsafe_allow_html=True,
        )

        with st.form("hitl"):
            decision = st.radio(
                "Decision",
                ["approve", "revise", "reject"],
                horizontal=True,
                label_visibility="collapsed",
            )
            feedback = st.text_area(
                "Reviewer feedback",
                placeholder="Required for revise/reject. Be specific — name table.column and the correct lineage.",
                height=100,
            )
            submitted = st.form_submit_button("Submit decision →", type="primary")

        if submitted:
            update_run(st.session_state.run_id, hitl_decision=decision, feedback=feedback)
            if decision != "approve":
                st.warning(f"Pipeline {decision}d. Feedback recorded for run `{st.session_state.run_id}`.")
                st.stop()

            with st.status("Generating production artifacts…", expanded=True) as status:
                st.write("◆ Stage 3 — emitting Teradata SQL + dbt models…")
                dev_out = dev_node({"mapping": spec})
                artifacts = dev_out["artifacts"]
                update_run(
                    st.session_state.run_id, stage="testing",
                    artifacts_json=json.dumps([a.model_dump() for a in artifacts]),
                )
                st.write(f"  → {len(artifacts)} artifacts written")
                st.write("◆ Stage 4 — generating GX + Soda + BTEQ tests…")
                test_out = testing_node({"mapping": spec, "artifacts": artifacts})
                report = test_out["test_report"]
                update_run(
                    st.session_state.run_id, stage="complete",
                    test_report_json=report.model_dump_json(),
                )
                st.write(f"  → {report.total} expectations · {report.soda_checks} soda checks · {report.bteq_statements} BTEQ stmts")
                status.update(label="✓ Pipeline complete", state="complete")

            st.balloons()

            # Test report
            st.markdown("### Test Coverage")
            stat_grid(
                [
                    ("GX Expectations", str(report.total), report.suite_name),
                    ("Soda Checks", str(report.soda_checks), "data quality"),
                    ("BTEQ Statements", str(report.bteq_statements), "control table"),
                    ("Suite Name", report.suite_name, None),
                ]
            )

            # Artifacts
            st.markdown("### Generated Artifacts")
            artifact_rows = []
            for a in artifacts:
                full = ROOT / a.path
                if full.exists():
                    artifact_rows.append(
                        {
                            "File": a.path,
                            "Kind": a.kind.upper(),
                            "Dialect": (a.dialect or "—").upper(),
                            "Target": a.target_table or "—",
                            "Size": f"{a.bytes_written:,} B",
                        }
                    )
            st.dataframe(pd.DataFrame(artifact_rows), width="stretch", hide_index=True)

            st.markdown("#### Downloads")
            cols = st.columns(3)
            for i, a in enumerate(artifacts):
                full = ROOT / a.path
                if full.exists():
                    with cols[i % 3]:
                        st.download_button(
                            f"⬇ {Path(a.path).name}",
                            full.read_bytes(),
                            file_name=Path(a.path).name,
                            mime="text/plain",
                            key=f"dl-{a.path}",
                        )


# ═══════════════════════════════════════════════════════════════════════════════
# FOOTER
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown(
    f"""
    <div class="footer">
      FSLDM · Data SDLC Console &nbsp;·&nbsp; v0.1.0 &nbsp;·&nbsp;
      Built with LangGraph · Claude · Streamlit &nbsp;·&nbsp;
      <a style="color:{GOLD};" href="#">Docs</a> &nbsp;·&nbsp;
      <a style="color:{GOLD};" href="#">Support</a>
    </div>
    """,
    unsafe_allow_html=True,
)
