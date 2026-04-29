import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../../services/api";
import { toast } from "react-toastify";

const unwrap = (res) => res?.data?.data ?? res?.data;

export const useLatestFuel = (assetMongoId) => {
  return useQuery({
    queryKey: ["fuel", "latest", assetMongoId],
    queryFn: async () => {
      const res = await api.get(`/fueltelemetry/asset/${assetMongoId}/latest`);
      return unwrap(res);
    },
    enabled: !!assetMongoId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFuelHistory = (assetMongoId, params = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );
  return useQuery({
    queryKey: ["fuel", "history", assetMongoId, cleaned],
    queryFn: async () => {
      const res = await api.get(`/fueltelemetry/asset/${assetMongoId}/history`, {
        params: cleaned,
      });
      return res?.data ?? {};
    },
    enabled: !!assetMongoId,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useManualSync = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assetMongoId) => {
      const res = await api.post(`/fueltelemetry/sync/${assetMongoId}`);
      return { result: unwrap(res), assetMongoId };
    },
    onSuccess: ({ result, assetMongoId }) => {
      if (result?.skipped) {
        toast.info(`Sync skipped: ${result.reason || "duplicate reading"}`);
      } else if (result?.eventType === "REFUEL") {
        toast.success(`Refuel detected: +${result.deltaFromPrev?.toFixed?.(2) ?? "?"} L`);
      } else if (result?.eventType === "DRAIN") {
        toast.warning(`Drain detected: ${result.deltaFromPrev?.toFixed?.(2) ?? "?"} L`);
      } else {
        toast.success("Fuel data refreshed");
      }
      qc.invalidateQueries({ queryKey: ["fuel", "latest", assetMongoId] });
      qc.invalidateQueries({ queryKey: ["fuel", "history", assetMongoId] });
      qc.invalidateQueries({ queryKey: ["machinery-list"] });
      if (onDone) onDone(result);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Sync failed";
      toast.error(msg);
    },
  });
};

export const useSyncAllFuel = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/fueltelemetry/sync-all`);
      return unwrap(res);
    },
    onSuccess: (stats) => {
      const { total = 0, synced = 0, skipped = 0, failed = 0, refuels = 0, drains = 0 } = stats || {};
      toast.success(
        `Synced ${synced}/${total} • Skipped ${skipped} • Failed ${failed} • Refuels ${refuels} • Drains ${drains}`
      );
      qc.invalidateQueries({ queryKey: ["machinery-list"] });
      qc.invalidateQueries({ queryKey: ["fuel"] });
      if (onDone) onDone(stats);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Sync all failed";
      toast.error(msg);
    },
  });
};
