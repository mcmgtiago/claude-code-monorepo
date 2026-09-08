import { serve, file } from "bun";
import { existsSync, statSync } from "fs";
import { join } from "path";

const CLIENT_DIR = join(import.meta.dir, "dist/client");
const PORT = parseInt(process.env.PORT || "3000");

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = join(CLIENT_DIR, url.pathname);

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      return new Response(file(filePath));
    }

    return new Response(file(join(CLIENT_DIR, "index.html")), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`Started server: http://localhost:${PORT}`);
