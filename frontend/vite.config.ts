import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  // Get API URL from environment variable or default to localhost
  // Note: In client code, use import.meta.env.VITE_API_URL instead
  const API_URL = env.VITE_API_URL || "http://localhost:8080";

  // Plugin to remove crossorigin attribute for file:// protocol compatibility
  const removeCrossoriginPlugin = (): Plugin => {
    return {
      name: "remove-crossorigin",
      transformIndexHtml(html) {
        return html.replace(/\s+crossorigin/g, "");
      },
    };
  };

  return {
    base: "/",
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
      removeCrossoriginPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/query": {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: mode === "development",
      minify: mode === "production" ? "esbuild" : false,
    },
  };
});
