/// <reference lib="deno.ns" />

import { build } from "https://deno.land/x/dnt@0.40.0/mod.ts";
import { rollup } from "npm:rollup";
import terserMod from "npm:@rollup/plugin-terser";

const terser = terserMod as unknown as typeof terserMod.default;

await build({
  entryPoints: ["./src/main.ts"],
  outDir: "./target/npm",

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
    Deno.copyFileSync("./src/styles.css", "./styles.css");

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
      file: "./main.js",
      format: "cjs",
      sourcemap: true,
    });

    await bundle.close();
    console.log("✅ Rollup 打包完成");
  },
});
