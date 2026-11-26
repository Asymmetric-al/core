import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { chromium } from "@playwright/test";

import {
  SIGN_IN_FIELD_SHADER,
  SIGN_IN_SHADER_STILL_TIME,
  SIGN_IN_VERTEX_SHADER,
} from "../../packages/ui/components/auth/sign-in-shader-source.ts";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const DEFAULT_OUTPUT = path.join(repositoryRoot, "apps/admin/app/(auth)/login");
const STILLS = [
  { file: "sign-in-still-wide.webp", width: 1920, height: 800 },
  { file: "sign-in-still-narrow.webp", width: 720, height: 960 },
] as const;
const WEBP_QUALITY = 0.8;

const RENDER_IN_PAGE = `async (input) => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const paint = probe.getContext("2d");
  paint.fillStyle = input.background;
  paint.fillRect(0, 0, 1, 1);
  const [red, green, blue] = paint.getImageData(0, 0, 1, 1).data;

  const canvas = document.createElement("canvas");
  canvas.width = input.width;
  canvas.height = input.height;
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) throw new Error("WebGL2 is not available in this browser.");
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, input.vertex],
    [gl.FRAGMENT_SHADER, input.fragment],
  ]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "Shader did not compile.");
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Program did not link.");
  }
  gl.viewport(0, 0, input.width, input.height);
  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, "iResolution"), input.width, input.height);
  gl.uniform1f(gl.getUniformLocation(program, "iTime"), input.time);
  gl.uniform1f(gl.getUniformLocation(program, "uLightMode"), 1);
  gl.uniform3f(gl.getUniformLocation(program, "uDarkBackground"), 0, 0, 0);
  gl.uniform3f(
    gl.getUniformLocation(program, "uLightBackground"),
    red / 255,
    green / 255,
    blue / 255,
  );
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return canvas.toDataURL("image/webp", input.quality);
}`;

function lightMutedToken() {
  const css = readFileSync(
    path.join(repositoryRoot, "packages/ui/styles/globals.css"),
    "utf8",
  );
  const value = /--muted:\s*([^;]+);/.exec(css)?.[1]?.trim();
  if (!value) throw new Error("globals.css has no light --muted token.");
  return value;
}

async function main() {
  const { values } = parseArgs({
    options: {
      time: { type: "string" },
      out: { type: "string" },
    },
  });
  const time = values.time ? Number(values.time) : SIGN_IN_SHADER_STILL_TIME;
  if (!Number.isFinite(time)) throw new Error("--time must be a number.");
  const outputDirectory = path.resolve(values.out ?? DEFAULT_OUTPUT);
  mkdirSync(outputDirectory, { recursive: true });

  const browser = await chromium.launch({
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  try {
    const page = await browser.newPage();
    for (const still of STILLS) {
      const input = {
        ...still,
        time,
        background: lightMutedToken(),
        vertex: SIGN_IN_VERTEX_SHADER,
        fragment: SIGN_IN_FIELD_SHADER,
        quality: WEBP_QUALITY,
      };
      const dataUrl = await page.evaluate<string>(
        `(${RENDER_IN_PAGE})(${JSON.stringify(input)})`,
      );
      const encoded = dataUrl.replace(/^data:image\/webp;base64,/, "");
      if (encoded === dataUrl)
        throw new Error("The browser did not encode WebP.");
      const target = path.join(outputDirectory, still.file);
      writeFileSync(target, Buffer.from(encoded, "base64"));
      process.stdout.write(
        `${path.relative(repositoryRoot, target)} ${still.width}x${still.height} t=${time}\n`,
      );
    }
  } finally {
    await browser.close();
  }
}

await main();
