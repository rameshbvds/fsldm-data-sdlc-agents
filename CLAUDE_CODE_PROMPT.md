# Claude Code Prompt for Demo Setup

## PROMPT (Copy and paste this into Claude Code):

```
Run the FSLDM demo with OCBC LLM. Check .env file has OCBC_API_KEY, then run pipeline with: LLM_PROVIDER=ocbc make run
```

## OR SHORTER:

```
Run the FSLDM demo pipeline with OCBC LLM integration
```

## OR FOR WINDOWS:

```
Run the FSLDM demo on Windows using run-demo.bat with OCBC LLM
```

## WHAT CLAUDE CODE WILL DO:

1. Check if .env exists and has OCBC_API_KEY
2. Verify virtual environment is setup
3. Run the pipeline: `LLM_PROVIDER=ocbc make run`
4. Show output and generated artifacts

## IF YOU WANT FULL SETUP:

```
Set up and run the FSLDM demo with OCBC LLM. Create .env from .env.example, add OCBC_API_KEY, install dependencies, and run the pipeline
```

---

**Recommended prompt (shortest, most effective):**

```
Run the FSLDM demo pipeline with OCBC LLM
```

This is all Claude Code needs to:
- Use the /run-pipeline skill
- Auto-detect OCBC configuration
- Execute the full 4-stage pipeline
- Show results and artifacts
