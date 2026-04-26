"use client";
import { Fragment } from "react";

const KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "NULL", "AS", "JOIN", "LEFT", "RIGHT",
  "INNER", "OUTER", "ON", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CASE",
  "WHEN", "THEN", "ELSE", "END", "GROUP", "BY", "HAVING", "ORDER", "DESC", "ASC", "UNION",
  "ALL", "DISTINCT", "TOP", "LIMIT", "QUALIFY", "OVER", "PARTITION", "ROW_NUMBER", "RANK",
  "CAST", "COALESCE", "ZEROIFNULL", "CURRENT_DATE", "CURRENT_TIMESTAMP", "FORMAT",
  "DECIMAL", "VARCHAR", "CHAR", "DATE", "TIMESTAMP", "INTEGER", "SMALLINT", "BIGINT",
  "DEFAULT", "WITH", "RECURSIVE", "TRUE", "FALSE", "IS", "IN", "EXISTS", "BETWEEN", "LIKE",
]);

type Token = { type: "kw" | "num" | "str" | "comment" | "ident" | "op" | "ws"; v: string };

function tokenize(sql: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    // whitespace
    if (/\s/.test(c)) {
      let j = i;
      while (j < sql.length && /\s/.test(sql[j])) j++;
      out.push({ type: "ws", v: sql.slice(i, j) });
      i = j;
      continue;
    }
    // line comment
    if (c === "-" && sql[i + 1] === "-") {
      const e = sql.indexOf("\n", i);
      const end = e < 0 ? sql.length : e;
      out.push({ type: "comment", v: sql.slice(i, end) });
      i = end;
      continue;
    }
    // block comment
    if (c === "/" && sql[i + 1] === "*") {
      const e = sql.indexOf("*/", i + 2);
      const end = e < 0 ? sql.length : e + 2;
      out.push({ type: "comment", v: sql.slice(i, end) });
      i = end;
      continue;
    }
    // string
    if (c === "'" || c === '"') {
      const quote = c;
      let j = i + 1;
      while (j < sql.length && sql[j] !== quote) j++;
      out.push({ type: "str", v: sql.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // number
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      out.push({ type: "num", v: sql.slice(i, j) });
      i = j;
      continue;
    }
    // identifier / keyword
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      out.push({ type: KEYWORDS.has(word.toUpperCase()) ? "kw" : "ident", v: word });
      i = j;
      continue;
    }
    // operator / punctuation
    out.push({ type: "op", v: c });
    i++;
  }
  return out;
}

const cls: Record<Token["type"], string> = {
  kw: "text-gold-400 font-semibold",
  num: "text-amber-400",
  str: "text-emerald-400",
  comment: "text-muted-foreground italic",
  ident: "text-foreground",
  op: "text-muted-foreground",
  ws: "",
};

export function HighlightedSQL({ sql, className = "" }: { sql: string; className?: string }) {
  const tokens = tokenize(sql);
  return (
    <code className={`font-mono text-xs leading-relaxed whitespace-pre-wrap break-all ${className}`}>
      {tokens.map((t, i) => (
        <Fragment key={i}>
          {t.type === "ws" ? t.v : <span className={cls[t.type]}>{t.v}</span>}
        </Fragment>
      ))}
    </code>
  );
}
