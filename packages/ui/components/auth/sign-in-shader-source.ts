/*! Field shader by @alexmiracle · OpenShaders · https://openshaders.com/@alexmiracle */

export const SIGN_IN_SHADER_STILL_TIME = 0;

export const SIGN_IN_VERTEX_SHADER = `#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const SIGN_IN_FIELD_SHADER = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uLightMode;
uniform vec3 uDarkBackground;
uniform vec3 uLightBackground;
out vec4 fragColor;

const float LIGHTNESS = 0.549594283;
const float LIGHT_CYCLE = 0.115062326;
const float LIGHT_TRAVEL = 2.22162986;
const float LIGHT_FIELD_TONE = 0.32;
const float THETA = 2.11010027;
const float SHEAR = 0.962068677;
const float SHRINK = 0.955530286;
const float LAYERS = 81.0;
const float WARP_FREQ_X = 0.5846892;
const float WARP_FREQ_Y = 2.43122697;
const float WARP_AMP_X = 0.101739891;
const float WARP_AMP_Y = 0.0227734521;
const float ASPECT_X = 2.32545638;
const float ASPECT_Y = 0.177258745;
const float OFFSET_X = 0.339116961;
const float OFFSET_Y = -0.0506321751;
const float TILT = -1.98592377;
const float ZOOM = 0.931328118;
const float CENTRE_X = -0.510877371;
const float CENTRE_Y = 0.469581306;
const float GLOW_SIZE = 0.0024640034;
const float FALLOFF = 0.412456542;
const float VIGNETTE = 0.116595976;
const float FLOW_SPEED = 0.383633196;
const float FLOW_DIRECTION = -1.0;
const float BREATH_RATE = 0.58522433;
const float BREATH_AMOUNT = 0.067503579;
const float PHASE = 72.7893524;
const float ECHO = 0.0;
const float ECHO_SHIFT = 0.159816563;
const float SOFTNESS = 0.00247653923;
const float LIGHT_SWING = 0.296623409;

float blueNoise(vec2 p, float frame) {
  p += 5.588238 * mod(frame, 64.0);
  return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y));
}

void main() {
  vec2 R = iResolution.xy;
  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;
  float t = iTime * FLOW_SPEED * FLOW_DIRECTION + PHASE;
  float breath = (-sin(iTime * BREATH_RATE * 1.5) + sin(iTime * BREATH_RATE + 1.0)) * 0.25 + 0.5;

  vec2 u = (pos - vec2(CENTRE_X, CENTRE_Y)) * (ZOOM - breath * BREATH_AMOUNT);
  float ct = cos(TILT), st = sin(TILT);
  u = mat2(ct, st, -st, ct) * u;

  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  float intensity = 0.0;

  for (float i = 1.0; i <= 96.0; i += 1.0) {
    if (i > LAYERS) break;
    u.x += -sin(u.y * WARP_FREQ_X + t + i * 0.007) * WARP_AMP_X;
    u.y += -sin(u.x * WARP_FREQ_Y - t + i * 0.02) * WARP_AMP_Y;
    u = fold * u * SHRINK;

    vec2 q = u - vec2(OFFSET_X + breath * 0.1, OFFSET_Y);
    vec2 s = vec2(q.x * ASPECT_X, q.y * ASPECT_Y);
    float glow = GLOW_SIZE / (dot(s, s) + SOFTNESS);
#ifndef SKIP_ECHO
    vec2 e = vec2((q.x - ECHO_SHIFT) * ASPECT_X, s.y);
    glow += ECHO * GLOW_SIZE / (dot(e, e) + SOFTNESS);
#endif
    glow *= 0.25 + breath * 0.4;

    float r = length(u);
    float k = sin(i * LIGHT_CYCLE + t * 1.2 + r * LIGHT_TRAVEL) * 0.5 + 0.5;
    float lightness = LIGHTNESS + LIGHT_SWING * k;
    float linearLight = lightness * lightness * lightness;
    intensity += glow * linearLight * exp2(-r * FALLOFF);
  }

  float tone = (intensity * (2.51 * intensity + 0.03)) /
    (intensity * (2.43 * intensity + 0.59) + 0.14);
  float strength = pow(clamp(tone, 0.0, 1.0), 0.92);

  float edge = smoothstep(0.5, 1.6, length(pos));
  strength *= 1.0 - edge * VIGNETTE;

  vec3 dark = mix(uDarkBackground, vec3(1.0), strength);
  vec3 light = mix(uLightBackground, vec3(LIGHT_FIELD_TONE), strength);
  vec3 color = mix(dark, light, uLightMode);

  color += (blueNoise(gl_FragCoord.xy, floor(iTime * 24.0)) - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
