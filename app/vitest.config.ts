import { defineConfig } from "vitest/config";

// Motor testleri saf TypeScript'tir; vite.config.ts'teki uygulama plugin'lerine
// ihtiyaç duymaz. Bu dosya varken vitest, vite.config.ts'i yüklemez.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
