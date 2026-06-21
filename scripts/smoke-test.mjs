/**
 * Smoke test: cek semua route web merespons tanpa error 500.
 * Jalankan saat dev server aktif: node scripts/smoke-test.mjs
 */
const BASE = process.env.EXPO_URL || "http://localhost:8081";

const ROUTES = [
  "/",
  "/finance",
  "/puyuh",
  "/summary",
  "/finance/income",
  "/finance/expense",
];

async function checkRoute(path) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const ok = res.status >= 200 && res.status < 400;
    return { path, status: res.status, ok };
  } catch (error) {
    return {
      path,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log(`Smoke test → ${BASE}\n`);
  const results = await Promise.all(ROUTES.map(checkRoute));
  let failed = 0;

  for (const r of results) {
    const label = r.ok ? "OK" : "FAIL";
    const extra = r.error ? ` (${r.error})` : "";
    console.log(`[${label}] ${r.path} → ${r.status}${extra}`);
    if (!r.ok) failed += 1;
  }

  console.log(`\n${results.length - failed}/${results.length} routes passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
