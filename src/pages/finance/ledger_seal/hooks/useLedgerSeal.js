import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "ledger-seal";

export const useLedgerSealStatus = () =>
  useQuery({
    queryKey: [QK, "status"],
    queryFn: async () => {
      const { data } = await api.get("/ledger-seal/status");
      return data?.data;
    },
    staleTime: 30_000,
  });

export const useLedgerSealList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/ledger-seal/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/* Full-chain verification — spec GET /ledger-seal/verify (no params). */
export const useLedgerSealVerify = () =>
  useQuery({
    queryKey: [QK, "verify"],
    queryFn: async () => {
      const { data } = await api.get("/ledger-seal/verify");
      return data?.data;
    },
    staleTime: 30_000,
  });

/* Sequence-range verify — spec GET /ledger-seal/verify-seq?from=N&to=N */
export const useLedgerSealVerifySeq = (params = {}) =>
  useQuery({
    queryKey: [QK, "verify-seq", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/ledger-seal/verify-seq", { params: p });
      return data?.data;
    },
    enabled: params?.from !== undefined && params?.from !== null,
    staleTime: 30_000,
  });

export const useLedgerSealBySequence = (sequence) =>
  useQuery({
    queryKey: [QK, "one", sequence],
    queryFn: async () => {
      const { data } = await api.get(`/ledger-seal/${sequence}`);
      return data?.data;
    },
    enabled: sequence !== undefined && sequence !== null,
  });

export const useSealApproved = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload = {}) =>
      api.post("/ledger-seal/seal-approved", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(
        `Sealed ${data?.sealed_count ?? data?.added ?? 0} JE(s). Chain hash updated.`
      );
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Seal failed")),
  });
};
