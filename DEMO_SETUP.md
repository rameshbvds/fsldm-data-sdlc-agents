# Demo Setup Guide

## ✅ Ready for Demo

### Live Demo URL (Recommended)
**Frontend:** https://fsldm.vercel.app

This is the production deployment - no setup required.

---

## 🔧 OCBC LLM Integration

The pipeline is now integrated with OCBC Bank's internal LLM platform (gpt-5.1-codex).

### Configuration

Update `.env` with your OCBC credentials:

```bash
LLM_PROVIDER=ocbc
OCBC_API_KEY=your_actual_api_key_here
OCBC_ENDPOINT=https://genaiplatform-appgw.dev.c2.ocbc.com/foundryeastus2/openai/v1/responses/
OCBC_MODEL=gpt-5.1-codex
```

### Test the Integration

```bash
make run
```

Expected output:
- Stage 1: Mapping Agent creates mappings
- Stage 2: Auto-approves (HITL)
- Stage 3: Generates Teradata + dbt SQL
- Stage 4: Generates GX tests + Soda checks

---

## 📦 Generated Artifacts

After each run, the pipeline creates:

```
sql_teradata/
  ├── fct_dpos_bal.gen.sql       (Teradata INSERT SELECT)
  ├── fct_dpos_evnt.gen.sql      (Teradata INSERT SELECT)
  └── fct_intrs_accrl.gen.sql   (Teradata INSERT SELECT)

sql_dbt_gen/
  ├── fct_dpos_bal.sql           (dbt Snowflake model)
  ├── fct_dpos_evnt.sql          (dbt Snowflake model)
  ├── fct_intrs_accrl.sql        (dbt Snowflake model)
  └── schema.gen.yml             (dbt schema docs)

gx/
  └── deposit_expectations.gen.json  (57 Great Expectations tests)

soda/
  └── deposit_checks.gen.yml      (Soda data quality checks)
```

---

## 🚀 Running the Pipeline

### With OCBC LLM
```bash
LLM_PROVIDER=ocbc make run
```

### With Local Claude CLI (Free Dev Mode)
```bash
LLM_PROVIDER=claude_code make run
```

### With OpenRouter (Paid API)
```bash
LLM_PROVIDER=openrouter OPENROUTER_API_KEY=your_key make run
```

---

## 🏠 Local Demo Setup (Optional)

### Prerequisites

Fix npm cache permissions (requires sudo):
```bash
sudo chown -R 501:20 "/Users/jabbir/.npm-cache"
```

### Start Frontend (Next.js)
```bash
cd web
npm install
npm run dev
# Runs on http://localhost:3000
```

### Start Streamlit App
```bash
make web
# Runs on http://localhost:8501
```

---

## 📊 Demo Checklist

- [x] OCBC LLM integrated in `agents/llm.py`
- [x] Pipeline generates all artifacts
- [x] Live demo URL working
- [ ] Update `.env` with actual OCBC API key
- [ ] (Optional) Fix npm cache for local demo
- [ ] Test Excel upload via live demo

---

## 🔍 Quick Test

```bash
# Test pipeline with OCBC LLM
LLM_PROVIDER=ocbc OCBC_API_KEY=your_key make run

# Verify artifacts generated
ls -la sql_teradata/*.gen.sql
ls -la gx/*.gen.json
```

---

## 📝 Architecture

1. **Mapping Agent** - Heuristic field mapping + optional LLM review
2. **HITL Gate** - Human-in-the-loop approval (auto-approve for demo)
3. **Dev Agent** - SQL generation (Teradata + dbt)
4. **Testing Agent** - Data quality tests (GX + Soda + BTEQ)

Total: **4 stages**, **3 target tables**, **57 test expectations**

---

## 🎯 Demo Flow

1. User uploads Excel mapping spec
2. Pipeline auto-generates field mappings
3. Review mappings in UI (approve/reject)
4. Generate SQL (Teradata + dbt)
5. Generate tests (GX + Soda)
6. Download artifacts or push to git

---

## 🆘 Troubleshooting

**LLM enrich skipped warning:**
- LLM is optional for core functionality
- Pipeline works without it (uses heuristics)
- To enable: Set valid API key in `.env`

**Port binding errors:**
- macOS permission issue
- Use live demo URL instead
- Or run: `sudo chown -R 501:20 ~/.npm-cache`

**npm install fails:**
- Clear cache: `npm cache clean --force`
- Install with temp cache: `npm install --cache /tmp/npm-cache`

---

**Last Updated:** 2026-04-28
**Status:** ✅ Ready for Demo
