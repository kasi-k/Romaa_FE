import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── Bank + Cash Accounts (for transfer from/to dropdowns) ─────────────── */
const fetchAllBankCashAccounts = async () => {
  const { data } = await api.get("/finance-dropdown/bank-accounts");
  return data?.data || [];
};

export const useBankAccounts = () =>
  useQuery({
    queryKey: ["finance-all-bank-cash-accounts"],
    queryFn:  fetchAllBankCashAccounts,
    staleTime: 60 * 1000,
  });

const QK = "bank-transfers";

/* ── Next Transfer Number ───────────────────────────────────────────────── */
const fetchNextBTNo = async () => {
  const { data } = await api.get("/banktransfer/next-no");
  return data?.data?.transfer_no || "";
};

export const useNextBTNo = () =>
  useQuery({
    queryKey: ["next-bt-no"],
    queryFn:  fetchNextBTNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── List Bank Transfers ─────────────────────────────────────────────────── */
const fetchBTList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/banktransfer/list", {
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

export const useBTList = (params = {}) =>
  useQuery({
    queryKey: [QK, params],
    queryFn:  fetchBTList,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Create Bank Transfer ───────────────────────────────────────────────── */
const createBT = async (payload) => {
  const { data } = await api.post("/banktransfer/create", payload);
  return data;
};

export const useCreateBT = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBT,
    onSuccess: () => {
      toast.success("Bank transfer created");
      queryClient.invalidateQueries({ queryKey: [QK] });
      queryClient.invalidateQueries({ queryKey: ["next-bt-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to create bank transfer")),
  });
};

/* ── Approve Bank Transfer ──────────────────────────────────────────────── */
export const useApproveBT = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/banktransfer/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Transfer approved — balances updated");
      queryClient.invalidateQueries({ queryKey: [QK] });
      queryClient.invalidateQueries({ queryKey: ["finance-all-bank-cash-accounts"] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to approve bank transfer")),
  });
};

/* ── Single Bank Transfer ───────────────────────────────────────────────── */
export const useBankTransfer = (id) =>
  useQuery({
    queryKey: [QK, "one", id],
    queryFn: async () => {
      const { data } = await api.get(`/banktransfer/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15 * 1000,
  });

/* ── Update Bank Transfer (draft, requires _version) ────────────────────── */
export const useUpdateBT = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(`/banktransfer/update/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Bank transfer updated");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to update bank transfer")),
  });
};

/* ── Delete Bank Transfer ───────────────────────────────────────────────── */
export const useDeleteBT = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/banktransfer/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Bank transfer deleted");
      queryClient.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete bank transfer")),
  });
};
