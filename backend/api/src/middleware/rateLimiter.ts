import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
        success: false,
        error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please wait 15 minutes before retrying.",
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        success: false,
        error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many search requests. Please wait a minute before retrying.",
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
