// preview/server.js — sobe um servidor estático só para visualização dos 4 templates
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4321;
const FILES = ["template1.html", "template2.html", "template3.html", "template4.html"];

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/" || urlPath === "") {
    const links = FILES.map(
      (f) => `<li><a href="/${f}" style="font-size:24px;">${f}</a></li>`
    ).join("");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html><html><body style="font-family:Arial;padding:40px;background:#222;color:#fff;">
      <h1>🪦 Preview dos templates feios</h1>
      <ul>${links}</ul>
    </body></html>`);
    return;
  }
  const filePath = path.join(__dirname, urlPath);
  if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath)) {
    res.writeHead(404).end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const types = { ".html": "text/html; charset=utf-8" };
  res.writeHead(200, { "Content-Type": types[ext] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Preview rodando em http://localhost:${PORT}`);
});