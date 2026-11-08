import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { SearchProviderError } from "../providers/search/TavilySearchProvider.js";

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        message: string
    ) {
        super(message);
        this.name = "AppError";
    }
}

export function notFound(req: Request, res: Response) {
    res.status(404).json({
        success: false,
        error: {
            code: "RESOURCE_NOT_FOUND",
            message: `Route ${req.method} ${req.url} not found.`,
            requestId: req.requestId,
        },
    });
}

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    logger.error({ err, requestId: req.requestId }, "Unhandled error");

    if (
        err instanceof SyntaxError &&
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        (err as { status?: number }).status === 400
    ) {
        res.status(400).json({
            success: false,
            error: {
                code: "INVALID_JSON",
                message: "The request body contains invalid JSON.",
                requestId: req.requestId,
            },
        });
        return;
    }

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "The request is invalid.",
                details: err.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                })),
                requestId: req.requestId,
            },
        });
        return;
    }

    if (err instanceof SearchProviderError) {
        const statusMap: Record<string, number> = {
            SEARCH_PROVIDER_NOT_CONFIGURED: 503,
            SEARCH_PROVIDER_AUTH_ERROR: 502,
            SEARCH_PROVIDER_RATE_LIMIT: 429,
            SEARCH_PROVIDER_TIMEOUT: 504,
            SEARCH_FAILED: 502,
        };
        res.status(statusMap[err.code] ?? 500).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                requestId: req.requestId,
            },
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                requestId: req.requestId,
            },
        });
        return;
    }

    // Do not leak internal error details
    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred. Please try again.",
            requestId: req.requestId,
        },
    });
}
