import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Vitest 4 + Vite 8 brechen unter Windows beim parallelen Laden aller
    // Testdateien reproduzierbar mit „Cannot read properties of undefined
    // (reading 'config')" ab (Worker-Pool-Regression, kein Testfehler –
    // einzeln laufen alle Dateien grün). Serielles Laden macht `npm test`
    // wieder plattformrobust und ändert keine Testinhalte. Siehe
    // docs/DECISIONS.md D-036 (Claude Opus 4.8).
    fileParallelism: false,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});

