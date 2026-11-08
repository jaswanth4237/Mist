import { apiClient } from "./apiClient";
import type {
    ApiResponse,
    LeadDto,
    PaginationMeta,
    LeadsQuery,
} from "@clientfinder/shared";

type LeadsResponse = ApiResponse<LeadDto[]> & { meta: PaginationMeta };
type LeadResponse = ApiResponse<LeadDto>;
type SaveResponse = ApiResponse<{ saved: boolean; leadId: string }>;

export const leadsApi = {
    list: (params: Partial<LeadsQuery>) =>
        apiClient.get<LeadsResponse>("/leads", params as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        apiClient.get<LeadResponse>(`/leads/${id}`),

    save: (id: string) =>
        apiClient.post<SaveResponse>(`/leads/${id}/save`),

    unsave: (id: string) =>
        apiClient.delete<SaveResponse>(`/leads/${id}/save`),
};
