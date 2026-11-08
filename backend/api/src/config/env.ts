import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    API_PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    SEARCH_PROVIDER: z.enum(["tavily", "brave"]).default("tavily"),
    TAVILY_API_KEY: z.string().optional(),
    BRAVE_SEARCH_API_KEY: z.string().optional(),
    LLM_PROVIDER: z.enum(["none", "openai"]).default("none"),
    LLM_API_KEY: z.string().optional(),
    LLM_MODEL: z.string().optional(),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    SEARCH_TIMEOUT_MS: z.coerce.number().default(20000),
    SEARCH_MAX_RESULTS: z.coerce.number().default(20),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});

function validateEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error("❌ Invalid environment configuration:");
        result.error.issues.forEach((issue) => {
            console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
        });
        process.exit(1);
    }

    const env = result.data;

    if (
        env.NODE_ENV === "production" &&
        ((env.SEARCH_PROVIDER === "tavily" && !env.TAVILY_API_KEY) ||
            (env.SEARCH_PROVIDER === "brave" && !env.BRAVE_SEARCH_API_KEY))
    ) {
        console.error(`❌ ${env.SEARCH_PROVIDER.toUpperCase()} API key is required in production.`);
        process.exit(1);
    }

    // Validate provider-specific keys
    if (env.SEARCH_PROVIDER === "tavily" && !env.TAVILY_API_KEY) {
        console.warn("⚠️  SEARCH_PROVIDER=tavily but TAVILY_API_KEY is not set. Search will fail.");
    }
    if (env.SEARCH_PROVIDER === "brave" && !env.BRAVE_SEARCH_API_KEY) {
        console.warn("⚠️  SEARCH_PROVIDER=brave but BRAVE_SEARCH_API_KEY is not set. Search will fail.");
    }

    return env;
}

export const env = validateEnv();
export type Env = typeof env;
