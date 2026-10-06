export function loadAdminMotionFeatures() {
  return import("./motion-features").then((module) => module.default);
}
