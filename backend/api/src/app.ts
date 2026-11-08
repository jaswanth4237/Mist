import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestId } from "./middleware/requestId.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { createHealthRouter } from "./routes/health.routes.js";
import { createSearchesRouter } from "./routes/searches.routes.js";
import { createLeadsRouter } from "./routes/leads.routes.js";
import { createSavedLeadsRouter } from "./routes/savedLeads.routes.js";
import { createSettingsRouter } from "./routes/settings.routes.js";
import { TavilySearchProvider } from "./providers/search/TavilySearchProvider.js";
import { BraveSearchProvider } from "./providers/search/BraveSearchProvider.js";
import type { SearchProvider } from "./providers/search/SearchProvider.js";

export function createApp(searchProvider?: SearchProvider) {
    const app = express();

    // ── Core middleware ────────────────────────────────────────────────────────
    app.use(helmet());
    app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(requestId);
    app.use(generalLimiter);

    // ── Provider ───────────────────────────────────────────────────────────────
    const provider: SearchProvider =
        searchProvider ??
        (env.SEARCH_PROVIDER === "tavily"
            ? new TavilySearchProvider(env.TAVILY_API_KEY, env.SEARCH_TIMEOUT_MS)
            : new BraveSearchProvider(env.BRAVE_SEARCH_API_KEY, env.SEARCH_TIMEOUT_MS));

    // ── Routes ─────────────────────────────────────────────────────────────────
    const API_PREFIX = "/api/v1";

    app.use(`${API_PREFIX}/health`, createHealthRouter(provider));
    app.use(`${API_PREFIX}/searches`, createSearchesRouter(provider));
    app.use(`${API_PREFIX}/leads`, createLeadsRouter());
    app.use(`${API_PREFIX}/saved-leads`, createSavedLeadsRouter());
    app.use(`${API_PREFIX}/settings`, createSettingsRouter());

    // ── 404 & Error handler ────────────────────────────────────────────────────
    app.use(notFound);
    app.use(errorHandler);

    return app;
}
