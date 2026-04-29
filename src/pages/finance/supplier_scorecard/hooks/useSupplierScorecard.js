import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";

const QK = "supplier-scorecard";

export const useVendorScorecard = (params = {}) =>
  useQuery({
    queryKey: [QK, "vendors", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/supplier-scorecard/vendors", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

export const useContractorScorecard = (params = {}) =>
  useQuery({
    queryKey: [QK, "contractors", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/supplier-scorecard/contractors", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

export const useVendorScorecardDetail = (vendor_id, params = {}) =>
  useQuery({
    queryKey: [QK, "vendor-detail", vendor_id, params],
    queryFn: async ({ queryKey }) => {
      const [, , vid, p] = queryKey;
      const { data } = await api.get(`/supplier-scorecard/vendor/${vid}`, { params: p });
      return data?.data;
    },
    enabled: !!vendor_id,
    staleTime: 30_000,
  });

export const useContractorScorecardDetail = (contractor_id, params = {}) =>
  useQuery({
    queryKey: [QK, "contractor-detail", contractor_id, params],
    queryFn: async ({ queryKey }) => {
      const [, , cid, p] = queryKey;
      const { data } = await api.get(`/supplier-scorecard/contractor/${cid}`, { params: p });
      return data?.data;
    },
    enabled: !!contractor_id,
    staleTime: 30_000,
  });
