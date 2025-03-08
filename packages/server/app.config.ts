import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    middleware: "src/backend/middleware/Middleware.ts",
    vite: {
        plugins: [tailwindcss()]
    },
    ssr: false
});
