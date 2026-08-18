/**
 * Which platform are we on, and is there a native bridge?
 *
 * Everything in engine/ has two implementations: the real one, which uses a
 * native plugin, and a browser one, which lets the whole app be developed and
 * demonstrated on a laptop. This module is the single place that decides which
 * to use, so no other file has to ask.
 */

function bridge() {
  return typeof window !== "undefined" ? window.Capacitor : undefined;
}

/** True when running inside the Android or iOS shell. */
export function isNative() {
  const cap = bridge();
  return Boolean(cap?.isNativePlatform?.());
}

/** "android" | "ios" | "web" */
export function platform() {
  const cap = bridge();
  return cap?.getPlatform?.() || "web";
}

/** True when a specific Capacitor plugin is actually present on this build. */
export function hasPlugin(name) {
  const cap = bridge();
  return Boolean(cap?.isPluginAvailable?.(name));
}

/**
 * A short phrase for the header chip. Being explicit that the laptop build is
 * a preview matters: a translation that came from the built-in phrasebook must
 * never be mistaken for one the real engine produced.
 */
export function environmentLabel() {
  if (isNative()) return platform() === "ios" ? "iPhone" : "Android";
  return "Browser preview";
}
