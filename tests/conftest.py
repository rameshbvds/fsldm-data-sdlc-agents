from pathlib import Path
import json
import pytest

ROOT = Path(__file__).parent.parent


@pytest.fixture(scope="session")
def src_schema() -> dict:
    return json.loads((ROOT / "schemas" / "deposit_source.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def tgt_schema() -> dict:
    return json.loads((ROOT / "schemas" / "deposit_target.json").read_text(encoding="utf-8"))
