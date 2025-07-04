import { build } from "https://deno.land/x/dnt@0.40.0/mod.ts";
import { rollup } from "npm:rollup";

await build({
  entryPoints: ["./src/main.ts"],
  outDir: "./target/npm",

  // 控制哪些格式要產出
  scriptModule: false, // 不輸出 CommonJS
  typeCheck: false, // 不檢查型別（可以加快速度）
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
    const bundle = await rollup({
      input: "./target/npm/esm/main.js",
      plugins: [],
      external: ["obsidian"],
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
