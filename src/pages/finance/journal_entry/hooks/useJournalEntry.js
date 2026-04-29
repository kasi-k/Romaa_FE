import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── Next JE Number ─────────────────────────────────────────────────────── */
const fetchNextJENo = async () => {
  const { data } = await api.get("/journalentry/next-no");
  return data;
};

export const useNextJENo = () =>
  useQuery({
    queryKey: ["next-je-no"],
    queryFn:  fetchNextJENo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── List Journal Entries ────────────────────────────────────────────────── */
const fetchJEList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/journalentry/list", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
      status: params.status,
    },
  });
  return { data: data?.data || [], pagination: data?.pagination || {} };
};

export const useJEList = (params = {}) =>
  useQuery({
    queryKey: ["journal-entries", params],
    queryFn:  fetchJEList,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });

/* ── Get JE by ID ────────────────────────────────────────────────────────── */
const fetchJEById = async ({ queryKey }) => {
  const [, id] = queryKey;
  const { data } = await api.get(`/journalentry/${id}`);
  return data?.data || null;
};

export const useJEById = (id) =>
  useQuery({
    queryKey: ["journal-entry", id],
    queryFn:  fetchJEById,
    enabled:  !!id,
  });

/* ── Create Journal Entry ────────────────────────────────────────────────── */
const createJEApi = async (payload) => {
  const { data } = await api.post("/journalentry/create", payload);
  return data;
};

export const useCreateJE = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJEApi,
    onSuccess: () => {
      toast.success("Journal entry created");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["next-je-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Failed to create journal entry"));
    },
  });
};

/* ── Update Journal Entry ────────────────────────────────────────────────── */
export const useUpdateJE = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(`/journalentry/update/${id}`, payload).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      toast.success("Journal entry updated");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entry", id] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Failed to update journal entry"));
    },
  });
};

/* ── Approve Journal Entry ───────────────────────────────────────────────── */
export const useApproveJE = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/journalentry/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Journal entry approved and posted");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to approve journal entry")),
  });
};

/* ── Reverse Journal Entry ───────────────────────────────────────────────── */
const reverseJEApi = async ({ id, ...payload }) => {
  const { data } = await api.post(`/journalentry/reverse/${id}`, payload);
  return data;
};

export const useReverseJE = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reverseJEApi,
    onSuccess: (res) => {
      toast.success(`Reversal JE created: ${res?.data?.je_no || ""}`);
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to reverse journal entry")),
  });
};

/* ── Delete Journal Entry ────────────────────────────────────────────────── */
export const useDeleteJE = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/journalentry/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Journal entry deleted");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete journal entry")),
  });
};

/* ── Process Auto-Reversals (admin) ──────────────────────────────────────── */
export const useProcessAutoReversals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/journalentry/process-auto-reversals").then((r) => r.data),
    onSuccess: (res) => {
      const ok  = res?.results?.filter((r) => r.status === "ok").length  || 0;
      const err = res?.results?.filter((r) => r.status === "error").length || 0;
      toast.success(`Auto-reversals processed: ${ok} ok, ${err} errors`);
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to process auto-reversals")),
  });
};

/* ── Posting Accounts (for line dropdowns) ───────────────────────────────── */
const fetchPostingAccounts = async () => {
  const { data } = await api.get("/accounttree/list", {
    params: { is_posting_account: true, limit: 500 },
  });
  return data?.data || [];
};

export const usePostingAccounts = () =>
  useQuery({
    queryKey: ["posting-accounts"],
    queryFn:  fetchPostingAccounts,
    staleTime: 5 * 60 * 1000,
  });

/* ── Tender IDs ──────────────────────────────────────────────────────────── */
const fetchTenderIds = async () => {
  const { data } = await api.get("/tender/gettendersid");
  return data?.data || [];
};

export const useTenderIds = () =>
  useQuery({
    queryKey: ["tender-ids"],
    queryFn:  fetchTenderIds,
    staleTime: 5 * 60 * 1000,
  });
