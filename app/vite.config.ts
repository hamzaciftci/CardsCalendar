import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // src/server.ts: SSR isteklerini saran hata yakalama katmanı
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // Deploy paketleyici: SSR'ı Vercel serverless fonksiyonuna, statikleri CDN'e
    // çıkarır (.vercel/output). Dev sunucusuna gerekmediği için yalnızca build'de.
    ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
  // Dev ve build aynı CSS hattını kullansın (PostCSS/esbuild farkı sürpriz üretmesin)
  css: { transformer: "lightningcss" },
  resolve: {
    // Çift React/Query kopyasını engelle (SSR + client)
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: { port: 8080 },
}));
