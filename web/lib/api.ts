export type FieldMapping = {
  target_column: string;
  source_expr: string;
  source_tables: string[];
  transform_note: string;
  confidence: number;
  open_question: string | null;
};
export type TargetTable = {
  target_table: string;
  grain_description: string;
  field_mappings: FieldMapping[];
  open_questions: string[];
};
export type MappingSpec = {
  mapping_id: string;
  dialect: string;
  target_tables: TargetTable[];
  notes: string;
};
export type Artifact = {
  path: string;
  kind: string;
  dialect: string | null;
  target_table: string | null;
  bytes_written: number;
};
export type TestReport = {
  suite_name: string;
  total: number;
  expectations: string[];
  soda_checks: number;
  bteq_statements: number;
};
export type Run = {
  run_id: string;
  created_at: string;
  user_email: string | null;
  dialect: string;
  stage: string;
  hitl_decision: string | null;
  feedback?: string;
  mapping?: MappingSpec;
  artifacts?: Artifact[];
  test_report?: TestReport;
};

const base = "";

export async function listRuns(): Promise<Run[]> {
  const r = await fetch(`${base}/api/runs`);
  return r.ok ? r.json() : [];
}
export async function getRun(id: string): Promise<Run | null> {
  const r = await fetch(`${base}/api/runs/${id}`);
  return r.ok ? r.json() : null;
}
export async function createRun(dialect: string, user_email = "demo@local") {
  const r = await fetch(`${base}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dialect, user_email }),
  });
  if (!r.ok) throw new Error("create run failed");
  return r.json() as Promise<{ run_id: string; mapping: MappingSpec }>;
}
export async function submitHitl(id: string, decision: string, feedback = "") {
  const r = await fetch(`${base}/api/runs/${id}/hitl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, feedback }),
  });
  if (!r.ok) throw new Error("hitl failed");
  return r.json();
}
export function artifactUrl(path: string) {
  return `${base}/api/artifacts/${path}`;
}
