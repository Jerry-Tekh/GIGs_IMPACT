import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_URL;

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: mode === "development" ? {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
    define: {
      "process.env": {
        VITE_SERVER_URL: JSON.stringify(serverUrl),
      },
    },
  });
};
