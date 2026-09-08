const fs = require("fs");
const path = require("path");

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return "";
  }

  const envContents = fs.readFileSync(envPath, "utf8");
  const match = envContents.match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?\s*$/m);

  return match ? match[1] : "";
}

const databaseUrl = readDatabaseUrl();

if (!databaseUrl.startsWith("file:")) {
  process.exit(0);
}

const filePath = databaseUrl.slice("file:".length);

if (!filePath || filePath === ":memory:") {
  process.exit(0);
}

const prismaDir = path.resolve(process.cwd(), "prisma");
const resolvedPath = path.resolve(prismaDir, filePath);

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

if (!fs.existsSync(resolvedPath)) {
  fs.closeSync(fs.openSync(resolvedPath, "w"));
}
