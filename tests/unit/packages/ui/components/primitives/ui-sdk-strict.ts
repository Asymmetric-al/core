// UI SDK development warnings (a slot missing what its role needs, ARIA a
// role does not take) throw in strict mode, so a test that hits one fails.
declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}

globalThis.__UI_SDK_STRICT__ = true;

export {};
