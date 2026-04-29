import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "company-bank-accounts";

/* ── List ────────────────────────────────────────────────────────────────── */
const fetchBankAccounts = async () => {
  const { data } = await api.get("/companybankaccount/list");
  return data?.data || [];
};

export const useCompanyBankDetails = () =>
  useQuery({
    queryKey: [QK],
    queryFn: fetchBankAccounts,
    staleTime: 30 * 1000,
  });

/* ── By account code (GL mapping lookup) ───────────────────────────────── */
export const useCompanyBankByCode = (code) =>
  useQuery({
    queryKey: [QK, "by-code", code],
    queryFn: async () => {
      const { data } = await api.get(`/companybankaccount/by-code/${code}`);
      return data?.data;
    },
    enabled: !!code,
    staleTime: 60_000,
  });

/* ── Single bank account by ObjectId ───────────────────────────────────── */
export const useCompanyBank = (id) =>
  useQuery({
    queryKey: [QK, "one", id],
    queryFn: async () => {
      const { data } = await api.get(`/companybankaccount/${id}`);
      return data?.data;
    },
    enabled: !!id,
  });

/* ── Create ─────────────────────────────────────────────────────────────── */
const createBankAccount = async (payload) => {
  const { data } = await api.post("/companybankaccount/create", payload);
  return data;
};

export const useCreateBankDetail = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      toast.success("Bank account created");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to create bank account")),
  });
};

/* ── Update ─────────────────────────────────────────────────────────────── */
const updateBankAccount = async ({ id, ...payload }) => {
  const { data } = await api.patch(`/companybankaccount/update/${id}`, payload);
  return data;
};

export const useUpdateBankDetail = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBankAccount,
    onSuccess: () => {
      toast.success("Bank account updated");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to update bank account")),
  });
};

/* ── Delete ─────────────────────────────────────────────────────────────── */
const deleteBankAccount = async (id) => {
  const { data } = await api.delete(`/companybankaccount/delete/${id}`);
  return data;
};

export const useDeleteBankDetail = ({ onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      toast.success("Bank account deleted");
      queryClient.invalidateQueries({ queryKey: [QK] });
      if (onClose) onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete bank account")),
  });
};
