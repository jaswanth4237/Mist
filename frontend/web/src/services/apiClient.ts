const API_BASE = "/api/v1";

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...init } = options;

    let url = `${API_BASE}${path}`;
    if (params) {
        const searchParams = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== "") {
                searchParams.set(k, String(v));
            }
        }
        const qs = searchParams.toString();
        if (qs) url = `${url}?${qs}`;
    }

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...init.headers,
        },
        ...init,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        const err = new ApiError(
            data?.error?.message ?? "An unexpected error occurred.",
            data?.error?.code ?? "UNKNOWN_ERROR",
            response.status
        );
        throw err;
    }

    return data;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly status: number
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const apiClient = {
    get: <T>(path: string, params?: FetchOptions["params"]) =>
        request<T>(path, { method: "GET", params }),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string) =>
        request<T>(path, { method: "DELETE" }),
};
