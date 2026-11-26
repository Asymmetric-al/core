/*!
 * @alexmiracle · OpenShaders
 * https://openshaders.com/@alexmiracle
 * WebGPU field shader, adapted for the Mission Control sign-in backdrop.
 */

export const SIGN_IN_SHADER_STILL_TIME = 0;

export const SIGN_IN_FIELD_SHADER = `struct Uniforms {
  resolution: vec2f,
  time: f32,
  lightMode: f32,
  darkBackground: vec3f,
  pixelRatio: f32,
  lightBackground: vec3f,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

const HUE: f32 = 0.776694238;
const HUE_SPREAD: f32 = -0.00625268556;
const HUE_TRAVEL: f32 = 2.22162986;
const CHROMA: f32 = 0.0950705856;
const LIGHTNESS: f32 = 0.549594283;
const COLOUR_CYCLE: f32 = 0.115062326;
const THETA: f32 = 2.11010027;
const SHEAR: f32 = 0.962068677;
const SHRINK: f32 = 0.955530286;
const LAYERS: f32 = 81.0;
const WARP_FREQ_X: f32 = 0.5846892;
const WARP_FREQ_Y: f32 = 2.43122697;
const WARP_AMP_X: f32 = 0.101739891;
const WARP_AMP_Y: f32 = 0.0227734521;
const ASPECT_X: f32 = 2.32545638;
const ASPECT_Y: f32 = 0.177258745;
const OFFSET_X: f32 = 0.339116961;
const OFFSET_Y: f32 = -0.0506321751;
const TILT: f32 = -1.98592377;
const ZOOM: f32 = 0.931328118;
const CENTRE_X: f32 = -0.510877371;
const CENTRE_Y: f32 = 0.469581306;
const GLOW_SIZE: f32 = 0.0024640034;
const FALLOFF: f32 = 0.412456542;
const VIGNETTE: f32 = 0.116595976;
const FLOW_SPEED: f32 = 0.383633196;
const FLOW_DIRECTION: f32 = -1.0;
const BREATH_RATE: f32 = 0.58522433;
const BREATH_AMOUNT: f32 = 0.067503579;
const PHASE: f32 = 72.7893524;
const ECHO: f32 = 0.0;
const ECHO_SHIFT: f32 = 0.159816563;
const SOFTNESS: f32 = 0.00247653923;
const LIGHT_SWING: f32 = 0.296623409;

@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let position = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(position * 2.0 - 1.0, 0.0, 1.0);
}

const TAU: f32 = 6.28318530718;

fn oklchToLinear(L: f32, C: f32, h: f32) -> vec3f {
  let a = C * cos(h);
  let b = C * sin(h);
  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  var lms = vec3f(l_, m_, s_);
  lms = lms * lms * lms;
  return mat3x3f(4.0767416621, -1.2684380046, -0.0041960863,
                 -3.3077115913, 2.6097574011, -0.7034186147,
                 0.2309699292, -0.3413193965, 1.7076147010) * lms;
}

fn fmod(x: f32, y: f32) -> f32 { return x - y * floor(x / y); }

fn blueNoise(p: vec2f, frame: f32) -> f32 {
  let q = p + 5.588238 * fmod(frame, 64.0);
  return fract(52.9829189 * fract(0.06711056 * q.x + 0.00583715 * q.y));
}

@fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let R = u.resolution;
  let frag = vec2f(position.x, R.y - position.y);
  let pos = (frag - 0.5 * R) / R.y;
  let t = u.time * FLOW_SPEED * FLOW_DIRECTION + PHASE;
  let breath = (-sin(u.time * BREATH_RATE * 1.5) + sin(u.time * BREATH_RATE + 1.0)) * 0.25 + 0.5;

  var p = (pos - vec2f(CENTRE_X, CENTRE_Y)) * (ZOOM - breath * BREATH_AMOUNT);
  let ct = cos(TILT);
  let st = sin(TILT);
  p = mat2x2f(ct, st, -st, ct) * p;

  let fold = mat2x2f(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  let hue0 = HUE * TAU;
  let hue1 = hue0 + HUE_SPREAD * TAU;
  var color = vec3f(0.0);

  for (var i: f32 = 1.0; i <= 96.0; i += 1.0) {
    if (i > LAYERS) { break; }
    p.x += -sin(p.y * WARP_FREQ_X + t + i * 0.007) * WARP_AMP_X;
    p.y += -sin(p.x * WARP_FREQ_Y - t + i * 0.02) * WARP_AMP_Y;
    p = fold * p * SHRINK;

    let q = p - vec2f(OFFSET_X + breath * 0.1, OFFSET_Y);
    let s = vec2f(q.x * ASPECT_X, q.y * ASPECT_Y);
    var glow = GLOW_SIZE / (dot(s, s) + SOFTNESS);
    if (ECHO > 0.0) {
      let e = vec2f((q.x - ECHO_SHIFT) * ASPECT_X, s.y);
      glow += ECHO * GLOW_SIZE / (dot(e, e) + SOFTNESS);
    }
    glow *= 0.25 + breath * 0.4;

    let r = length(p);
    let k = sin(i * COLOUR_CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    let tint = clamp(oklchToLinear(LIGHTNESS + LIGHT_SWING * k, CHROMA * (0.75 + 0.35 * k), mix(hue0, hue1, k)), vec3f(0.0), vec3f(1.0));
    color += glow * tint * exp2(-r * FALLOFF);
  }

  let x = max(color, vec3f(0.0));
  color = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  color = pow(clamp(color, vec3f(0.0), vec3f(1.0)), vec3f(0.85, 0.92, 0.98));

  let edge = smoothstep(0.5, 1.6, length(pos));
  color *= 1.0 - edge * VIGNETTE;

  let dark = u.darkBackground + color * (1.0 - u.darkBackground);
  let strength = max(color.r, max(color.g, color.b));
  let light = u.lightBackground * (1.0 - strength) + color * 0.96;
  color = mix(dark, light, vec3f(u.lightMode));

  color += (blueNoise(frag, floor(u.time * 24.0)) - 0.5) / 255.0;
  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}
`;

export const SIGN_IN_UNIFORM_FLOATS = 12;

export type ShaderTheme = "dark" | "light";

export type RgbColor = readonly [number, number, number];

export interface FieldFrame {
  width: number;
  height: number;
  time: number;
  theme: ShaderTheme;
  dark: RgbColor;
  light: RgbColor;
  pixelRatio: number;
}

export function parseHex(hex: string): RgbColor {
  const digits = /^#([0-9a-f]{6})$/i.exec(hex.trim())?.[1];
  if (!digits) {
    throw new Error(`Background colours must be #rrggbb, got "${hex}".`);
  }
  const channel = (offset: number) =>
    parseInt(digits.slice(offset, offset + 2), 16) / 255;
  return [channel(0), channel(2), channel(4)];
}

export function writeFieldUniforms(target: Float32Array, frame: FieldFrame) {
  target.set([
    frame.width,
    frame.height,
    frame.time,
    frame.theme === "light" ? 1 : 0,
    ...frame.dark,
    frame.pixelRatio,
    ...frame.light,
    0,
  ]);
}
