FROM python:3.12-slim

WORKDIR /app

# System deps for dbt/sqlglot (minimal — Streamlit + Python only)
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements-dev.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-dev.txt streamlit pandas

COPY agents/ ./agents/
COPY schemas/ ./schemas/
COPY app.py ./
COPY .streamlit/ ./.streamlit/

# Generated artifacts dirs
RUN mkdir -p sql_teradata sql_dbt_gen sql_bteq gx soda data

ENV PYTHONIOENCODING=utf-8 \
    PYTHONUTF8=1 \
    LLM_PROVIDER=auto \
    PYTHONPATH=/app

EXPOSE 8501

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8501/_stcore/health || exit 1

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
