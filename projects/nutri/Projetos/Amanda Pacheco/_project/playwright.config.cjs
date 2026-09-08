const path = require("node:path");

module.exports = {
  testDir: __dirname,
  testMatch: "smoke.spec.cjs",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  webServer: {
    command: "python -m http.server 4173 --bind 127.0.0.1",
    cwd: path.join(__dirname, ".."),
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  outputDir: path.join(
    "C:/Users/ADMINI~1/AppData/Local/Temp/opencode",
    "amanda-playwright-results",
  ),
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: "msedge",
    headless: true,
    colorScheme: "light",
    locale: "pt-PT",
    trace: "retain-on-failure",
  },
};
