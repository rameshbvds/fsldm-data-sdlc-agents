"""logging_setup.py — structlog configuration with PII-safe processors."""
from __future__ import annotations
import logging
import sys

import structlog

PII_KEYS = {"prty_full_nm", "prty_shrt_nm", "dob_dt", "tax_resid_cd", "email", "ssn"}


def _redact_pii(_, __, event_dict):
    for k in list(event_dict.keys()):
        if k.lower() in PII_KEYS:
            event_dict[k] = "***"
    return event_dict


def configure(level: str = "INFO", fmt: str = "console") -> None:
    logging.basicConfig(stream=sys.stderr, level=getattr(logging, level.upper(), logging.INFO))
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        _redact_pii,
    ]
    if fmt == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=False))
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(getattr(logging, level.upper(), 20)),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)
