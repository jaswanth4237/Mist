import { apiClient } from "./apiClient";
import type {
    ApiResponse,
    CreateSearchRequest,
    SearchRunDto,
    LeadDto,
    PaginationMeta,
    SearchesQuery,
} from "@clientfinder/shared";

type SearchCreateResponse = ApiResponse<{
    searchRun: SearchRunDto;
    leads: LeadDto[];
}> & { meta: { resultCount: number } };

type SearchesResponse = ApiResponse<SearchRunDto[]> & { meta: PaginationMeta };
type SearchResponse = ApiResponse<SearchRunDto>;

export const searchesApi = {
    create: (data: CreateSearchRequest) =>
        apiClient.post<SearchCreateResponse>("/searches", data),

    list: (params?: Partial<SearchesQuery>) =>
        apiClient.get<SearchesResponse>("/searches", params as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        apiClient.get<SearchResponse>(`/searches/${id}`),

    getLeads: (id: string) =>
        apiClient.get<ApiResponse<{ searchRun: SearchRunDto; leads: LeadDto[] }>>(`/searches/${id}/leads`),
};
