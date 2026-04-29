import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";

const fetchWorkDoneList = async (tenderId, params) => {
  const { data } = await api.get(`/workorderdone/api/list/${tenderId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return data;
};

export const useWorkDoneList = (tenderId, queryParams = {}) => {
  return useQuery({
    queryKey: ["workorderdone-list", tenderId, queryParams],
    queryFn: () => fetchWorkDoneList(tenderId, queryParams),
    enabled: !!tenderId,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

const fetchWorkDoneSummary = async (tenderId) => {
  const { data } = await api.get(`/workorderdone/api/summary/${tenderId}`);
  return data?.data || [];
};

export const useWorkDoneSummary = (tenderId) => {
  return useQuery({
    queryKey: ["workorderdone-summary", tenderId],
    queryFn: () => fetchWorkDoneSummary(tenderId),
    enabled: !!tenderId,
    staleTime: 2 * 60 * 1000,
  });
};

const fetchWorkDoneDetail = async (tenderId, workDoneId) => {
  const { data } = await api.get(`/workorderdone/api/details/${tenderId}/${workDoneId}`);
  return data?.data || null;
};

export const useWorkDoneDetail = (tenderId, workDoneId) => {
  return useQuery({
    queryKey: ["workorderdone-detail", tenderId, workDoneId],
    queryFn: () => fetchWorkDoneDetail(tenderId, workDoneId),
    enabled: !!tenderId && !!workDoneId,
    staleTime: 60 * 1000,
  });
};

const fetchWorkDoneByDate = async (tenderId, reportDate) => {
  const { data } = await api.get(`/workorderdone/api/report-date/${tenderId}/${reportDate}`);
  // Normalise: API may return a single doc or an array
  const raw = data?.data;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
};

export const useWorkDoneByDate = (tenderId, reportDate) => {
  return useQuery({
    queryKey: ["workorderdone-by-date", tenderId, reportDate],
    queryFn: () => fetchWorkDoneByDate(tenderId, reportDate),
    enabled: !!tenderId && !!reportDate,
    staleTime: 60 * 1000,
  });
};
