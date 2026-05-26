import { defineConfig } from "vitest/config";

// Root vitest config — delegates to workspace configs
export default defineConfig({
  test: {
    // Each package has its own vitest config
    // This root config is used for workspace-level runs
    reporter: ["verbose"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules",
        "dist",
        "**/*.config.{ts,js}",
        "**/test/**",
        "**/__tests__/**",
      ],
    },
  },
});
