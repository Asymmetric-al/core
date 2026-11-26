import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { chromium } from "@playwright/test";

import {
  SIGN_IN_FIELD_SHADER,
  SIGN_IN_SHADER_STILL_TIME,
  SIGN_IN_UNIFORM_FLOATS,
  parseHex,
  writeFieldUniforms,
} from "../../packages/ui/components/auth/sign-in-shader-source.ts";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const DEFAULT_OUTPUT = path.join(repositoryRoot, "apps/admin/app/(auth)/login");
const STILLS = [
  { file: "sign-in-still-wide.webp", width: 3200, height: 800 },
  { file: "sign-in-still-narrow.webp", width: 720, height: 960 },
] as const;
const WEBP_QUALITY = 0.8;
const MANIFEST = "sign-in-stills.json";
const MIN_SPREAD = 24;
const MIN_DEVIATION = 3;

interface PixelStats {
  mean: number;
  deviation: number;
  min: number;
  max: number;
  violet: number;
}

interface RenderedStill {
  dataUrl: string;
  stats: PixelStats;
}

const TO_HEX_IN_PAGE = `(color) => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const paint = probe.getContext("2d");
  paint.fillStyle = "#000000";
  paint.fillStyle = color;
  paint.fillRect(0, 0, 1, 1);
  const [red, green, blue] = paint.getImageData(0, 0, 1, 1).data;
  return "#" + [red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("");
}`;

const RENDER_IN_PAGE = `async (input) => {
  if (!navigator.gpu) throw new Error("WebGPU is not available in this browser.");
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No WebGPU adapter is available.");
  const device = await adapter.requestDevice();
  try {
    device.pushErrorScope("validation");
    const format = "rgba8unorm";
    const module = device.createShaderModule({ code: input.shader });
    const pipeline = await device.createRenderPipelineAsync({
      layout: "auto",
      vertex: { module, entryPoint: "vertexMain" },
      fragment: { module, entryPoint: "fragmentMain", targets: [{ format }] },
      primitive: { topology: "triangle-list" },
    });
    const uniforms = device.createBuffer({ size: input.uniforms.length * 4, usage: 0x40 | 0x08 });
    device.queue.writeBuffer(uniforms, 0, new Float32Array(input.uniforms));
    const texture = device.createTexture({ size: [input.width, input.height], format, usage: 0x10 | 0x01 });
    const bytesPerRow = Math.ceil((input.width * 4) / 256) * 256;
    const readback = device.createBuffer({ size: bytesPerRow * input.height, usage: 0x01 | 0x08 });
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{ view: texture.createView(), loadOp: "clear", storeOp: "store" }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniforms } }],
    }));
    pass.draw(3);
    pass.end();
    encoder.copyTextureToBuffer({ texture }, { buffer: readback, bytesPerRow }, [input.width, input.height]);
    device.queue.submit([encoder.finish()]);
    const error = await device.popErrorScope();
    if (error) throw new Error(error.message);
    await readback.mapAsync(0x01);
    const padded = new Uint8Array(readback.getMappedRange());
    const pixels = new Uint8ClampedArray(input.width * input.height * 4);
    for (let row = 0; row < input.height; row += 1) {
      pixels.set(padded.subarray(row * bytesPerRow, row * bytesPerRow + input.width * 4), row * input.width * 4);
    }
    readback.unmap();

    let sum = 0;
    let squares = 0;
    let min = 255;
    let max = 0;
    let violet = 0;
    const count = input.width * input.height;
    for (let index = 0; index < pixels.length; index += 4) {
      const luma = 0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2];
      sum += luma;
      squares += luma * luma;
      min = Math.min(min, luma);
      max = Math.max(max, luma);
      violet += pixels[index + 2] - pixels[index + 1];
    }
    const mean = sum / count;

    const canvas = document.createElement("canvas");
    canvas.width = input.width;
    canvas.height = input.height;
    canvas.getContext("2d").putImageData(new ImageData(pixels, input.width, input.height), 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/webp", input.quality),
      stats: {
        mean,
        deviation: Math.sqrt(Math.max(0, squares / count - mean * mean)),
        min,
        max,
        violet: violet / count,
      },
    };
  } finally {
    device.destroy();
  }
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

function sha256(data: string | Buffer) {
  return createHash("sha256").update(data).digest("hex");
}

function assertNonBlank(file: string, stats: PixelStats) {
  const problems = [
    stats.max - stats.min < MIN_SPREAD && "it has almost no tonal range",
    stats.deviation < MIN_DEVIATION && "it is nearly uniform",
    stats.mean < 64 && "it is too dark for the light theme",
    stats.violet <= 0 && "it lost the field's violet tint",
  ].filter(Boolean);
  if (problems.length > 0) {
    throw new Error(`${file} is not a usable still: ${problems.join("; ")}.`);
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      time: { type: "string" },
      out: { type: "string" },
    },
  });
  if (values.time !== undefined && values.out === undefined) {
    throw new Error(
      "--time renders a non-runtime frame, so it needs --out to keep the committed stills intact.",
    );
  }
  const time = values.time ? Number(values.time) : SIGN_IN_SHADER_STILL_TIME;
  if (!Number.isFinite(time)) throw new Error("--time must be a number.");
  const outputDirectory = path.resolve(values.out ?? DEFAULT_OUTPUT);
  mkdirSync(outputDirectory, { recursive: true });

  const server = createServer((_request, response) => {
    response.setHeader("content-type", "text/html");
    response.end("<!doctype html><title>Sign-in still capture</title>");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    const browser = await chromium.launch({ channel: "chrome" });
    try {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${port}/`);
      const token = lightMutedToken();
      const hex = await page.evaluate<string>(
        `(${TO_HEX_IN_PAGE})(${JSON.stringify(token)})`,
      );
      const background = parseHex(hex);
      const written: {
        file: string;
        width: number;
        height: number;
        sha256: string;
      }[] = [];
      for (const still of STILLS) {
        const uniforms = new Float32Array(SIGN_IN_UNIFORM_FLOATS);
        writeFieldUniforms(uniforms, {
          width: still.width,
          height: still.height,
          time,
          theme: "light",
          dark: background,
          light: background,
          pixelRatio: 1,
        });
        const input = {
          width: still.width,
          height: still.height,
          shader: SIGN_IN_FIELD_SHADER,
          uniforms: Array.from(uniforms),
          quality: WEBP_QUALITY,
        };
        const rendered = await page.evaluate<RenderedStill>(
          `(${RENDER_IN_PAGE})(${JSON.stringify(input)})`,
        );
        assertNonBlank(still.file, rendered.stats);
        const encoded = rendered.dataUrl.replace(
          /^data:image\/webp;base64,/,
          "",
        );
        if (encoded === rendered.dataUrl) {
          throw new Error("The browser did not encode WebP.");
        }
        const target = path.join(outputDirectory, still.file);
        const bytes = Buffer.from(encoded, "base64");
        writeFileSync(target, bytes);
        written.push({
          file: still.file,
          width: still.width,
          height: still.height,
          sha256: sha256(bytes),
        });
        const { mean, deviation, min, max, violet } = rendered.stats;
        process.stdout.write(
          `${path.relative(repositoryRoot, target)} ${still.width}x${still.height} t=${time} ` +
            `luma ${min.toFixed(0)}–${max.toFixed(0)} mean ${mean.toFixed(1)} sd ${deviation.toFixed(1)} violet ${violet.toFixed(1)}\n`,
        );
      }
      const manifest = {
        shaderSha256: sha256(SIGN_IN_FIELD_SHADER),
        time,
        background: { token, hex },
        stills: written,
      };
      writeFileSync(
        path.join(outputDirectory, MANIFEST),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
    } finally {
      await browser.close();
    }
  } finally {
    server.close();
  }
}

await main();
