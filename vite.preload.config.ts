// import { defineConfig } from "vite";
// import { resolve } from "path";
// import pkg from "./package.json";
//
// // https://vitejs.dev/config
// export default defineConfig({
//   resolve: {
//     alias: {
//       "@": resolve(__dirname, "./src"),
//     },
//   },
//   build: {
//     outDir: ".vite/build",
//     lib: {
//       entry: "src/preload.ts",
//       formats: ["es"],
//       fileName: () => "[name].js",
//     },
//     rollupOptions: {
//       external: [
//         "electron",
//         "electron-squirrel-startup",
//
//         ...Object.keys(pkg.dependencies || {}),
//       ],
//       output: {
//         entryFileNames: "[name].js",
//       },
//     },
//     emptyOutDir: false, // Don't empty out the directory as the main process files might be there
//     minify: process.env.NODE_ENV === "production",
//   },
// });

import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({});
