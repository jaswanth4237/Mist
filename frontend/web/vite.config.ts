import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// When running inside Docker the API is at the service name, not localhost
const API_TARGET = process.env.VITE_API_URL || "http://localhost:3000";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@clientfinder/shared": path.resolve(__dirname, "../../backend/shared/src/index.ts"),
        },
    },
    server: {
        host: "0.0.0.0",   // bind to all interfaces so Docker port-mapping works
        port: 5173,
        proxy: {
            "/api": {
                target: API_TARGET,
                changeOrigin: true,
            },
        },
    },
});
