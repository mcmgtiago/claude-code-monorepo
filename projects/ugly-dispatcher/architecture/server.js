// server.js — servidor estático simples para abrir architecture/index.html com ES modules
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5177;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function safeResolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = clean === "/" ? "/index.html" : clean;
  const filePath = path.join(__dirname, normalized);
  if (!filePath.startsWith(__dirname)) return null;
  return filePath;
}

const server = http.createServer((req, res) => {
  const filePath = safeResolve(req.url);

  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Não encontrado");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": types[ext] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Mapa visual rodando em http://localhost:${PORT}`);
});
