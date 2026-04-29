import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, extractApiError, isApprovalRequired } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── Shared party hooks (re-exported from DN/CN) ────────────────────────── */
export { useTenderIds, useVendors, useContractors } from "../../debit_creditnote/hooks/useDebitCreditNote";

/* ── Approve Payment Voucher ────────────────────────────────────────────── */
export const useApprovePV = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ id, bank_account_code }) =>
      api.patch(`/paymentvoucher/approve/${id}`, { bank_account_code }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Payment voucher approved");
      queryClient.invalidateQueries({ queryKey: ["cash-payment-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["finance-cash-only-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["finance-payable-bills"] });
    },
    onError: (err) => {
      if (isApprovalRequired(err)) {
        toast.info("Amount exceeds threshold — redirected to approval queue.");
        navigate("/finance/approvals");
        return;
      }
      toast.error(extractApiError(err, "Failed to approve payment voucher"));
    },
  });
};

/* ── Approve Receipt Voucher ────────────────────────────────────────────── */
export const useApproveRV = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ id, bank_account_code }) =>
      api.patch(`/receiptvoucher/approve/${id}`, { bank_account_code }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Receipt voucher approved");
      queryClient.invalidateQueries({ queryKey: ["cash-receipt-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["finance-cash-only-accounts"] });
    },
    onError: (err) => {
      if (isApprovalRequired(err)) {
        toast.info("Amount exceeds threshold — redirected to approval queue.");
        navigate("/finance/approvals");
        return;
      }
      toast.error(extractApiError(err, "Failed to approve receipt voucher"));
    },
  });
};

/* ── Next PV Number ─────────────────────────────────────────────────────── */
const fetchNextPVNo = async () => {
  const { data } = await api.get("/paymentvoucher/next-no");
  return data?.pv_no || "";
};

export const useNextPVNo = () =>
  useQuery({
    queryKey: ["next-pv-no"],
    queryFn:  fetchNextPVNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Next RV Number ─────────────────────────────────────────────────────── */
const fetchNextRVNo = async () => {
  const { data } = await api.get("/receiptvoucher/next-no");
  return data?.rv_no || "";
};

export const useNextRVNo = () =>
  useQuery({
    queryKey: ["next-rv-no"],
    queryFn:  fetchNextRVNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Create Payment Voucher ─────────────────────────────────────────────── */
const createPVApi = async (payload) => {
  const { data } = await api.post("/paymentvoucher/create", payload);
  return data;
};

export const useCreatePV = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPVApi,
    onSuccess: () => {
      toast.success("Payment voucher created successfully");
      queryClient.invalidateQueries({ queryKey: ["cash-payment-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["next-pv-no"] });
      queryClient.invalidateQueries({ queryKey: ["finance-payable-bills"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Failed to create payment voucher"));
    },
  });
};

/* ── Create Receipt Voucher ─────────────────────────────────────────────── */
const createRVApi = async (payload) => {
  const { data } = await api.post("/receiptvoucher/create", payload);
  return data;
};

export const useCreateRV = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRVApi,
    onSuccess: () => {
      toast.success("Receipt voucher created successfully");
      queryClient.invalidateQueries({ queryKey: ["cash-receipt-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["next-rv-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Failed to create receipt voucher"));
    },
  });
};

/* ── List Payment Vouchers ──────────────────────────────────────────────── */
const fetchPVList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/paymentvoucher/list/cash", {
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

export const usePVList = (params = {}) =>
  useQuery({
    queryKey: ["cash-payment-vouchers", params],
    queryFn:  fetchPVList,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── List Receipt Vouchers ──────────────────────────────────────────────── */
const fetchRVList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/receiptvoucher/list/cash", {
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

export const useRVList = (params = {}) =>
  useQuery({
    queryKey: ["cash-receipt-vouchers", params],
    queryFn:  fetchRVList,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Finance Dropdown: Bank Accounts with Balance ───────────────────────── */
const fetchBankAccounts = async () => {
  const { data } = await api.get("/finance-dropdown/cash-only");
  return data?.data || [];
};

export const useBankAccounts = () =>
  useQuery({
    queryKey: ["finance-cash-only-accounts"],
    queryFn:  fetchBankAccounts,
    staleTime: 60 * 1000,
  });

/* ── Finance Dropdown: Payable Bills ─────────────────────────────────────── */
const fetchPayableBills = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/finance-dropdown/payable-bills", { params });
  return data?.data || [];
};

export const usePayableBills = (params = {}) =>
  useQuery({
    queryKey: ["finance-payable-bills", params],
    queryFn:  fetchPayableBills,
    enabled:  !!params.supplier_id,
    staleTime: 30 * 1000,
  });

/* ── Update Payment Voucher ─────────────────────────────────────────────── */
export const useUpdatePV = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/paymentvoucher/update/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Payment voucher updated");
      queryClient.invalidateQueries({ queryKey: ["cash-payment-vouchers"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to update payment voucher")),
  });
};

/* ── Update Receipt Voucher ─────────────────────────────────────────────── */
export const useUpdateRV = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/receiptvoucher/update/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Receipt voucher updated");
      queryClient.invalidateQueries({ queryKey: ["cash-receipt-vouchers"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to update receipt voucher")),
  });
};

/* ── Delete Payment Voucher ─────────────────────────────────────────────── */
export const useDeletePV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/paymentvoucher/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Payment voucher deleted");
      queryClient.invalidateQueries({ queryKey: ["cash-payment-vouchers"] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete payment voucher")),
  });
};

/* ── Delete Receipt Voucher ─────────────────────────────────────────────── */
export const useDeleteRV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/receiptvoucher/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Receipt voucher deleted");
      queryClient.invalidateQueries({ queryKey: ["cash-receipt-vouchers"] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete receipt voucher")),
  });
};

/* ── Finance Dropdown: Parties by Tender ─────────────────────────────────── */
const fetchParties = async ({ queryKey }) => {
  const [, tenderId, type] = queryKey;
  const params = type ? { type } : {};
  const { data } = await api.get(`/finance-dropdown/parties/${tenderId}`, { params });
  return data?.data || [];
};

export const useParties = (tenderId, type) =>
  useQuery({
    queryKey: ["finance-parties", tenderId, type],
    queryFn:  fetchParties,
    enabled:  !!tenderId,
    staleTime: 60 * 1000,
  });
