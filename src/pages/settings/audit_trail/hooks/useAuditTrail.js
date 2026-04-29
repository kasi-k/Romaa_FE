import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, extractApiError } from "../../../../services/api";

const QK = "app-audit";

const cleanParams = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined),
  );

// GET /audit — admin cross-module list with filters + pagination
export const useAuditTrail = (params = {}, { enabled = true } = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async () => {
      const { data } = await api.get("/audit", { params: cleanParams(params) });
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

// GET /audit/counts — dashboard aggregate
export const useAuditCounts = (params = {}, { enabled = true } = {}) =>
  useQuery({
    queryKey: [QK, "counts", params],
    queryFn: async () => {
      const { data } = await api.get("/audit/counts", { params: cleanParams(params) });
      return data?.data || [];
    },
    enabled,
    staleTime: 60_000,
  });

// GET /audit/:entity_type/:entity_id — full timeline for one record
export const useEntityAudit = (entityType, entityId) =>
  useQuery({
    queryKey: [QK, "entity", entityType, entityId],
    queryFn: async () => {
      const { data } = await api.get(`/audit/${entityType}/${entityId}`);
      return data?.data || [];
    },
    enabled: !!entityType && !!entityId,
    staleTime: 30_000,
  });

// GET /audit/me — caller's own actions
export const useMyAudit = (params = {}) =>
  useQuery({
    queryKey: [QK, "me", params],
    queryFn: async () => {
      const { data } = await api.get("/audit/me", { params: cleanParams(params) });
      return data?.data || [];
    },
    staleTime: 30_000,
  });

// POST /audit/retention/run — manually trigger archive
export const useRunRetention = ({ onSuccess } = {}) =>
  useMutation({
    mutationFn: async (retention_days) => {
      const body = retention_days ? { retention_days: Number(retention_days) } : {};
      const { data } = await api.post("/audit/retention/run", body);
      return data?.data;
    },
    onSuccess: (data) => {
      const app = data?.app?.archived ?? data?.app?.count ?? 0;
      const fin = data?.finance?.archived ?? data?.finance?.count ?? 0;
      toast.success(`Archived ${app} app rows and ${fin} finance rows.`);
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Archive run failed")),
  });
