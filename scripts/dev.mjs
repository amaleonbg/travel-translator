/**
 * `npm run dev` — build, watch, and serve www/ on http://localhost:5173.
 *
 * Deliberately a plain Node static server rather than a framework dev server.
 * The app has no backend, so there is nothing to proxy, and a dependency-free
 * server is one fewer thing that can break on a Windows machine two months
 * from now.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { spawn } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wwwDir = join(root, "www");
const port = Number(process.env.PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
};

// ---------------------------------------------------------------------------
// Watcher — optional on purpose
// ---------------------------------------------------------------------------
//
// `www/app.js` is committed to the project already built, so this server runs
// with nothing installed at all: `node scripts/dev.mjs` and you have the app.
// That matters for the very first look at it, when asking someone to sit
// through `npm install` before they have seen anything is a poor trade.
//
// Once esbuild is installed the watcher starts too, and edits to src/ rebuild
// automatically. So the same command does the right thing before and after.

const hasEsbuild = await import("esbuild").then(
  () => true,
  () => false
);

let watcher = null;
if (hasEsbuild) {
  watcher = spawn(process.execPath, [join(root, "scripts/build.mjs"), "--watch"], {
    stdio: "inherit",
  });
  process.on("exit", () => watcher?.kill());
  process.on("SIGINT", () => {
    watcher?.kill();
    process.exit(0);
  });
}

const bundleExists = await stat(join(wwwDir, "app.js")).then(
  () => true,
  () => false
);

if (!bundleExists && !hasEsbuild) {
  console.error(
    "\n  www/app.js is missing and esbuild is not installed.\n" +
      "  Run `npm install` once, then `npm run dev` again.\n"
  );
  process.exit(1);
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const relative = normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = resolve(join(wwwDir, relative));

    // Refuse to serve anything outside www/, however the path was spelled.
    if (!filePath.startsWith(resolve(wwwDir))) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    const info = await stat(filePath).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end(String(err));
  }
});

server.listen(port, () => {
  console.log(`\n  Travel Translator — browser preview`);
  console.log(`  http://localhost:${port}`);
  console.log(
    `  ${hasEsbuild ? "Watching src/ — edits rebuild automatically." : "Serving the prebuilt bundle (run `npm install` to enable live rebuilds)."}\n`
  );
  console.log(`  Note: this is the preview build. Translation comes from the built-in`);
  console.log(`  phrasebook, because ML Kit only exists on a phone. Everything else —`);
  console.log(`  the flow, the log, the phrasebook, the layout — is the real thing.\n`);
  console.log(`  Press Ctrl+C to stop.\n`);
});
