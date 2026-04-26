export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="font-mono">
            FSLDM·SDLC <span className="text-gold-400">v0.1.0</span> · build {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-6">
            <span>LangGraph · Claude · Next.js</span>
            <span className="hidden md:inline">SOC 2 ready · PII-redacted logs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
