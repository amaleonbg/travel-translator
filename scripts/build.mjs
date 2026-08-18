/**
 * Bundle src/js into www/app.js.
 *
 * A build step is unwelcome in a project this small, but Capacitor plugins are
 * npm packages and a browser cannot resolve a bare `import` of one. esbuild is
 * the cheapest way to close that gap: one dependency, sub-second builds, and no
 * config file to drift out of date. Everything else in www/ is plain static
 * files served as they are.
 */
import { build, context } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const watch = process.argv.includes("--watch");

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: [join(root, "src/js/main.js")],
  outfile: join(root, "www/app.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  // Android WebViews on supported devices are Chrome 90+; iOS 15.5 is the
  // floor ML Kit imposes anyway. Targeting these keeps optional chaining and
  // top-level classes intact rather than transpiling them into noise.
  target: ["chrome90", "safari15"],
  sourcemap: true,
  minify: !watch,
  legalComments: "none",
  logLevel: "info",
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("[build] watching src/js — edit and refresh the browser");
} else {
  await build(options);
  console.log("[build] www/app.js written");
}
