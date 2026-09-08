import { serve, file } from "bun";
import { existsSync, statSync } from "fs";
import { join } from "path";
import ssrServer from "./dist/server/server.js";

const CLIENT_DIR = join(import.meta.dir, "dist/client");
const PORT = parseInt(process.env.PORT || "3000");

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files from dist/client/ first
    const filePath = join(CLIENT_DIR, url.pathname);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      return new Response(file(filePath));
    }

    // Fall back to SSR handler for all routes
    return ssrServer.fetch(req);
  },
});

console.log(`Started server: http://localhost:${PORT}`);

// ── Agendador interno ─────────────────────────────────────────────
// Bate em /api/cron/tick periodicamente (lembretes de agendamento etc.).
// Roda dentro do próprio processo de produção — não precisa de cron externo.
// Desligue com INTERNAL_SCHEDULER=off (ex.: se for usar cron-job.org).
const CRON_SECRET = process.env.CRON_SECRET;
const TICK_MS = parseInt(process.env.SCHEDULER_INTERVAL_MS || String(10 * 60 * 1000));

async function runTick() {
  try {
    const req = new Request(`http://localhost:${PORT}/api/cron/tick?key=${encodeURIComponent(CRON_SECRET)}`);
    const res = await ssrServer.fetch(req);
    const j = await res.json().catch(() => ({}));
    console.log("[scheduler] tick", JSON.stringify(j.jobs ?? j));
  } catch (e) {
    console.warn("[scheduler] tick falhou:", e?.message || e);
  }
}

if (CRON_SECRET && process.env.INTERNAL_SCHEDULER !== "off") {
  setTimeout(runTick, 30_000); // primeira execução 30s após subir
  setInterval(runTick, TICK_MS); // depois, a cada 10 min
  console.log(`[scheduler] interno ativo (cada ${Math.round(TICK_MS / 60000)} min)`);
} else {
  console.log("[scheduler] interno desligado (defina CRON_SECRET ou use INTERNAL_SCHEDULER=off)");
}
