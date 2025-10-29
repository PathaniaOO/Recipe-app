import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,      // you can use global test functions like `test`, `expect`
    setupFiles: "./src/setupTests.js"
  }
});
