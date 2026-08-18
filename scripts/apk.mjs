/**
 * `npm run apk` — build a debug APK you can copy straight onto a phone.
 *
 * Wraps three steps that must happen in this order and are easy to get wrong:
 * bundle the web code, copy it into the Android project, then run Gradle. The
 * classic failure is editing `src/`, rebuilding in Android Studio, and getting
 * the *previous* version because the copy step was skipped.
 *
 * Cross-platform on purpose (gradlew.bat on Windows, ./gradlew elsewhere), so
 * the same command works wherever the project ends up.
 */
import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const release = process.argv.includes("--release");

function run(command, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      // npx and gradlew.bat are batch scripts on Windows; without a shell,
      // spawn cannot execute them.
      shell: isWindows,
    });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`))
    );
  });
}

const androidDir = join(root, "android");
const hasAndroid = await stat(androidDir).then(
  () => true,
  () => false
);
if (!hasAndroid) {
  console.error(
    "\n  There is no android/ folder.\n" +
      "  Run `npm install` then `npx cap add android` first.\n"
  );
  process.exit(1);
}

console.log("\n[1/3] Bundling the web code…");
await run(process.execPath, [join(root, "scripts/build.mjs")]);

console.log("\n[2/3] Copying it into the Android project…");
await run("npx", ["cap", "sync", "android"]);

console.log(`\n[3/3] Building the ${release ? "release" : "debug"} APK with Gradle…`);
console.log("      The first run downloads Gradle and the Android libraries — expect 5–15 minutes.\n");
const gradlew = isWindows ? "gradlew.bat" : "./gradlew";
const task = release ? "assembleRelease" : "assembleDebug";
await run(gradlew, [task], androidDir);

const out = join(
  androidDir,
  "app/build/outputs/apk",
  release ? "release" : "debug",
  release ? "app-release.apk" : "app-debug.apk"
);

console.log(`\n  Done.\n  ${out}\n`);
console.log("  Copy that file to your phone and tap it to install.");
console.log("  You will have to allow 'install unknown apps' for whatever app you opened it from.\n");
