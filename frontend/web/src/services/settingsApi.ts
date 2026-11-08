import { apiClient } from "./apiClient";
import type { ApiResponse, AppSettingsDto, DashboardStatsDto } from "@clientfinder/shared";

type SettingsResponse = ApiResponse<AppSettingsDto>;
type StatsResponse = ApiResponse<DashboardStatsDto>;

export const settingsApi = {
    get: () => apiClient.get<SettingsResponse>("/settings"),

    update: (theme: "dark" | "light") =>
        apiClient.patch<SettingsResponse>("/settings", { theme }),

    getDashboardStats: () => apiClient.get<StatsResponse>("/settings/dashboard-stats"),

    getSavedLeads: (params?: Record<string, string | number | undefined>) =>
        apiClient.get<ApiResponse<unknown[]>>("/saved-leads", params),
};
