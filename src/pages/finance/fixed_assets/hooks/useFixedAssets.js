import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "fixed-assets";

/* ── Register (consolidated) ─────────────────────────────────────── */
export const useAssetRegister = (params = {}) =>
  useQuery({
    queryKey: [QK, "register", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/fixedasset/register", { params: p });
      return data?.data;
    },
    staleTime: 60_000,
  });

/* ── List ────────────────────────────────────────────────────────── */
export const useAssetList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/fixedasset/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/* ── Single ──────────────────────────────────────────────────────── */
export const useAssetDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/fixedasset/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

/* ── Depreciation schedule ───────────────────────────────────────── */
export const useAssetSchedule = (id, max_months = 120) =>
  useQuery({
    queryKey: [QK, "schedule", id, max_months],
    queryFn: async () => {
      const { data } = await api.get(`/fixedasset/${id}/schedule`, { params: { max_months } });
      return data?.data;
    },
    enabled: !!id,
    staleTime: 300_000,
  });

/* ── Create ──────────────────────────────────────────────────────── */
export const useCreateAsset = ({ onSuccess, onClose } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/fixedasset/create", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Fixed asset added");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to add asset")),
  });
};

/* ── Update ──────────────────────────────────────────────────────── */
export const useUpdateAsset = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/fixedasset/update/${id}`, payload).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Asset updated");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Update failed")),
  });
};

/* ── Archive ─────────────────────────────────────────────────────── */
export const useArchiveAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/fixedasset/${id}/archive`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Asset archived");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Archive failed")),
  });
};

/* ── Post depreciation (all assets) ─────────────────────────────── */
export const usePostDepreciation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period_date) =>
      api.post("/fixedasset/post-depreciation", period_date ? { period_date } : {}).then((r) => r.data?.data),
    onSuccess: (result) => {
      toast.success(`Depreciation posted: ${result?.posted ?? 0} asset(s)`);
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Depreciation failed")),
  });
};

/* ── Post depreciation (single asset) ───────────────────────────── */
export const useDepreciateOne = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, period_date }) =>
      api.post(`/fixedasset/${id}/depreciate`, period_date ? { period_date } : {}).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Depreciation posted for this asset");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Depreciation failed")),
  });
};

/* ── Dispose ─────────────────────────────────────────────────────── */
export const useDisposeAsset = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.post(`/fixedasset/${id}/dispose`, payload).then((r) => r.data?.data),
    onSuccess: (_, { id }) => {
      toast.success("Asset disposed — JE posted");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Disposal failed")),
  });
};

/* ── Post IT-Act depreciation (all assets, shadow — no JE) ──────── */
export const usePostITDepreciation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period_date) =>
      api.post("/fixedasset/post-it-depreciation", period_date ? { period_date } : {}).then((r) => r.data?.data),
    onSuccess: (result) => {
      toast.success(`IT-Act depreciation posted: ${result?.posted ?? 0} asset(s)`);
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "IT depreciation failed")),
  });
};

/* ── Post IT-Act depreciation (single asset) ─────────────────────── */
export const useITDepreciateOne = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, period_date }) =>
      api.post(`/fixedasset/${id}/it-depreciate`, period_date ? { period_date } : {}).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("IT-Act depreciation posted for this asset");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "IT depreciation failed")),
  });
};

/* ── Dual depreciation reconciliation report ─────────────────────── */
export const useDualDepreciationReport = (params = {}) =>
  useQuery({
    queryKey: [QK, "dual-dep-report", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/fixedasset/dual-depreciation-report", { params: p });
      return data?.data || [];
    },
    staleTime: 60_000,
  });
