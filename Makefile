# FSLDM Data SDLC Agents — task runner
PY := .venv/Scripts/python.exe
ifeq ($(OS),)
PY := .venv/bin/python
endif

DIALECT ?= teradata

.PHONY: help setup run dry show-schema test typecheck lint lint-sql clean web web-docker

help:
	@echo "make setup       — create venv and install dev deps"
	@echo "make run         — run pipeline (DIALECT=teradata default)"
	@echo "make dry         — dry-run pipeline plan"
	@echo "make show-schema — print source/target schemas"
	@echo "make test        — pytest"
	@echo "make typecheck   — mypy"
	@echo "make lint        — ruff"
	@echo "make lint-sql    — sqlglot validate every generated SQL"
	@echo "make clean       — remove generated artifacts"
	@echo "make web         — start Streamlit UAT app (http://localhost:8501)"
	@echo "make web-docker  — build + run via docker compose"

setup:
	py -3.12 -m venv .venv
	$(PY) -m pip install --upgrade pip
	$(PY) -m pip install -e ".[dev]"

run:
	PYTHONIOENCODING=utf-8 PYTHONUTF8=1 LLM_PROVIDER=$${LLM_PROVIDER:-claude_code} \
	  $(PY) -m agents.main run --dialect $(DIALECT) --hitl-decision approve

dry:
	$(PY) -m agents.main run --dry-run

show-schema:
	$(PY) -m agents.main show-schema

test:
	$(PY) -m pytest

typecheck:
	$(PY) -m mypy agents

lint:
	$(PY) -m ruff check agents tests

lint-sql:
	$(PY) -m agents.sql_validate --all

clean:
	rm -f sql_teradata/*.gen.sql sql_dbt_gen/*.sql sql_dbt_gen/*.gen.yml \
	      gx/*.gen.json soda/*.gen.yml sql_bteq/*.gen.sql

web:
	PYTHONIOENCODING=utf-8 PYTHONUTF8=1 LLM_PROVIDER=$${LLM_PROVIDER:-claude_code} \
	  $(PY) -m streamlit run app.py

web-docker:
	docker compose up --build
