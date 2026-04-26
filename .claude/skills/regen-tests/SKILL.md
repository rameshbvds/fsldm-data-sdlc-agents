---
name: regen-tests
description: Regenerate GX expectations, Soda checks, and BTEQ validation SQL from the current MappingSpec without re-running mapping or dev stages.
allowed-tools: Bash(.venv/Scripts/python.exe:*), Bash(.venv/bin/python:*), Read
agent: data-test-writer
context: fork
effort: medium
---

Regenerate the test artifacts only (faster than full pipeline).

```bash
.venv/Scripts/python.exe -c "
from agents.main import load_schemas
from agents.mapping_agent import _heuristic_mapping
from agents.testing_agent import testing_node
src, tgt, rules = load_schemas()
spec = _heuristic_mapping(src, tgt, 'teradata')
out = testing_node({'mapping': spec, 'artifacts': []})
print('Test report:', out['test_report'])
"
```

Then list the regenerated files and their byte counts.
