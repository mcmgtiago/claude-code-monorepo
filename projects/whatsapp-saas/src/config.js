const fs = require("node:fs");
const path = require("node:path");

function parseEnvFile(filePath) {
  try {
    const contents = fs.readFileSync(filePath, "utf8");
    const values = {};

    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const separator = line.indexOf("=");
      if (separator === -1) continue;

      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      values[key] = value;
    }

    return values;
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function loadConfig(rootDir = process.cwd()) {
  const fileValues = parseEnvFile(path.join(rootDir, ".env"));
  const env = { ...fileValues, ...process.env };

  return {
    port: positiveInteger(env.PORT, 3001),
    accessToken: env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || "",
    apiVersion: env.WHATSAPP_API_VERSION || "v25.0",
    graphBaseUrl: (env.WHATSAPP_GRAPH_BASE_URL || "https://graph.facebook.com").replace(/\/$/, ""),
    defaultDelaySeconds: Math.max(5, Math.min(3600, positiveInteger(env.DEFAULT_DELAY_SECONDS, 15))),
    dataFile: path.join(rootDir, "data", "store.json"),
    publicDir: path.join(rootDir, "public")
  };
}

function isWhatsAppConfigured(config) {
  return Boolean(config.accessToken && config.phoneNumberId);
}

module.exports = { isWhatsAppConfigured, loadConfig };
