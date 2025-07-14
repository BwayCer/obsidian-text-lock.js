/// <reference lib="deno.ns" />

import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { build } from "https://deno.land/x/dnt@0.40.0/mod.ts";
import { rollup } from "npm:rollup";
import terserMod from "npm:@rollup/plugin-terser";
import { isTest } from "./src/data.ts";

const terser = terserMod as unknown as typeof terserMod.default;

// // @ts-ignore: Deno 推斷錯誤，terser 是 default export function

await build({
  entryPoints: ["./src/main.ts"],
  outDir: "./target/npm",

  // typeCheck: false,
  typeCheck: "both", // TS 檢查. 有效值: both, single (不清楚差異)
  // https://github.com/denoland/dnt/blob/main/README.md#dom-types
  compilerOptions: {
    lib: [
      "ES2021",
      "DOM",
    ],
  },

  // 控制哪些格式要產出
  scriptModule: false, // 不輸出 CommonJS
  declaration: false, // 不輸出 .d.ts 型別檔
  test: false, // 不輸出測試檔

  shims: {
    deno: true, // 如果用到 Deno API，就需要加 shims
  },

  package: {
    name: "obsidian-note-lock",
    version: "1.0.0",
  },

  async postBuild() {
    if (!isTest) {
      await ensureDir("./target/obsidian");
      Deno.copyFileSync(
        "./manifest.json",
        "./target/obsidian/manifest.json",
      );
    }
    Deno.copyFileSync(
      "./src/styles.css",
      isTest ? "./styles.css" : "./target/obsidian/styles.css",
    );

    const bundle = await rollup({
      input: "./target/npm/esm/main.js",
      plugins: [
        terser({
          compress: false, // 不進行壓縮
          mangle: false, // 不改變變數名稱
          format: {
            beautify: true,
            comments: false, // 移除所有註解
            indent_level: 2,
          },
        }),
      ],
      external: [
        "obsidian",
      ],
    });

    await bundle.write({
      file: isTest ? "./main.js" : "./target/obsidian/main.js",
      format: "cjs",
      sourcemap: isTest,
    });

    await bundle.close();
    console.log("✅ Rollup 打包完成");
  },
});
