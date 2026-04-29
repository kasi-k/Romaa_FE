import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

/* ── Tender IDs ─────────────────────────────────────────────────────────── */
const fetchTenderIds = async () => {
  const { data } = await api.get("/tender/gettendersid");
  return data.data || [];
};

export const useTenderIds = () =>
  useQuery({
    queryKey: ["tender-ids"],
    queryFn:  fetchTenderIds,
    staleTime: 5 * 60 * 1000,
  });

/* ── Vendors for a tender ───────────────────────────────────────────────── */
const fetchVendors = async ({ queryKey }) => {
  const [, tenderId] = queryKey;
  const { data } = await api.get(`/permittedvendor/getvendor/${tenderId}`);
  return data?.permitted_vendors ?? data?.data?.permitted_vendors ?? [];
};

export const useVendors = (tenderId) =>
  useQuery({
    queryKey: ["permitted-vendors", tenderId],
    queryFn:  fetchVendors,
    enabled:  !!tenderId,
  });

/* ── Contractors for a tender ───────────────────────────────────────────── */
const fetchContractors = async ({ queryKey }) => {
  const [, tenderId] = queryKey;
  const { data } = await api.get(`/contractor/getbytender/${tenderId}`);
  return data?.contractors ?? data?.data ?? [];
};

export const useContractors = (tenderId) =>
  useQuery({
    queryKey: ["contractors", tenderId],
    queryFn:  fetchContractors,
    enabled:  !!tenderId,
  });

/* ── Next CN number ─────────────────────────────────────────────────────── */
const fetchNextCNNo = async () => {
  const { data } = await api.get("/creditnote/next-no");
  return data?.cn_no || "";
};

export const useNextCNNo = () =>
  useQuery({
    queryKey: ["next-cn-no"],
    queryFn:  fetchNextCNNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Next DN number ─────────────────────────────────────────────────────── */
const fetchNextDNNo = async () => {
  const { data } = await api.get("/debitnote/next-no");
  return data?.dn_no || "";
};

export const useNextDNNo = () =>
  useQuery({
    queryKey: ["next-dn-no"],
    queryFn:  fetchNextDNNo,
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── Create Credit Note ─────────────────────────────────────────────────── */
const createCNApi = async (payload) => {
  const { data } = await api.post("/creditnote/create", payload);
  return data;
};

export const useCreateCN = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCNApi,
    onSuccess: () => {
      toast.success("Credit note created successfully");
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["next-cn-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Failed to create credit note"));
    },
  });
};

/* ── Create Debit Note ──────────────────────────────────────────────────── */
const createDNApi = async (payload) => {
  const { data } = await api.post("/debitnote/create", payload);
  return data;
};

export const useCreateDN = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDNApi,
    onSuccess: () => {
      toast.success("Debit note created successfully");
      queryClient.invalidateQueries({ queryKey: ["debit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["next-dn-no"] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Failed to create debit note"));
    },
  });
};

/* ── Approve Credit Note ────────────────────────────────────────────────── */
export const useApproveCN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/creditnote/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Credit note approved");
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to approve credit note")),
  });
};

/* ── Re-export hooks shared with Payment Voucher ────────────────────────── */
export { usePayableBills } from "../../bank_transactions/hooks/useVouchers";

/* ── Approve Debit Note ─────────────────────────────────────────────────── */
export const useApproveDN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/debitnote/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Debit note approved");
      queryClient.invalidateQueries({ queryKey: ["debit-notes"] });
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to approve debit note")),
  });
};

/* ── List Credit Notes ──────────────────────────────────────────────────── */
const fetchCNList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/creditnote/list", {
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

export const useCNList = (params = {}) =>
  useQuery({
    queryKey: ["credit-notes", params],
    queryFn:  fetchCNList,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });

/* ── List Debit Notes ───────────────────────────────────────────────────── */
const fetchDNList = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/debitnote/list", {
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

export const useDNList = (params = {}) =>
  useQuery({
    queryKey: ["debit-notes", params],
    queryFn:  fetchDNList,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });

/* ── Get Credit Note by ID ──────────────────────────────────────────────── */
const fetchCNById = async ({ queryKey }) => {
  const [, id] = queryKey;
  const { data } = await api.get(`/creditnote/${id}`);
  return data?.data || null;
};

export const useCNById = (id) =>
  useQuery({
    queryKey: ["credit-note", id],
    queryFn:  fetchCNById,
    enabled:  !!id,
  });

/* ── Get Debit Note by ID ───────────────────────────────────────────────── */
const fetchDNById = async ({ queryKey }) => {
  const [, id] = queryKey;
  const { data } = await api.get(`/debitnote/${id}`);
  return data?.data || null;
};

export const useDNById = (id) =>
  useQuery({
    queryKey: ["debit-note", id],
    queryFn:  fetchDNById,
    enabled:  !!id,
  });

/* ── Update Credit Note ─────────────────────────────────────────────────── */
export const useUpdateCN = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/creditnote/update/${id}`, payload).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      toast.success("Credit note updated");
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["credit-note", id] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to update credit note")),
  });
};

/* ── Update Debit Note ──────────────────────────────────────────────────── */
export const useUpdateDN = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/debitnote/update/${id}`, payload).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      toast.success("Debit note updated");
      queryClient.invalidateQueries({ queryKey: ["debit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["debit-note", id] });
      if (onSuccess) onSuccess();
      if (onClose)   onClose();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to update debit note")),
  });
};

/* ── Delete Credit Note ─────────────────────────────────────────────────── */
export const useDeleteCN = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/creditnote/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Credit note deleted");
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete credit note")),
  });
};

/* ── Delete Debit Note ──────────────────────────────────────────────────── */
export const useDeleteDN = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/debitnote/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Debit note deleted");
      queryClient.invalidateQueries({ queryKey: ["debit-notes"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete debit note")),
  });
};

/* ── Credit Notes by Supplier ───────────────────────────────────────────── */
const fetchCNBySupplier = async ({ queryKey }) => {
  const [, supplierId, params] = queryKey;
  const { data } = await api.get(`/creditnote/by-supplier/${supplierId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return { data: data?.data || [], pagination: data?.pagination || {} };
};

export const useCNBySupplier = (supplierId, params = {}) =>
  useQuery({
    queryKey: ["credit-notes-by-supplier", supplierId, params],
    queryFn:  fetchCNBySupplier,
    enabled:  !!supplierId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Debit Notes by Supplier ────────────────────────────────────────────── */
const fetchDNBySupplier = async ({ queryKey }) => {
  const [, supplierId, params] = queryKey;
  const { data } = await api.get(`/debitnote/by-supplier/${supplierId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return { data: data?.data || [], pagination: data?.pagination || {} };
};

export const useDNBySupplier = (supplierId, params = {}) =>
  useQuery({
    queryKey: ["debit-notes-by-supplier", supplierId, params],
    queryFn:  fetchDNBySupplier,
    enabled:  !!supplierId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Credit Notes by Tender ─────────────────────────────────────────────── */
const fetchCNByTender = async ({ queryKey }) => {
  const [, tenderId, params] = queryKey;
  const { data } = await api.get(`/creditnote/by-tender/${tenderId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return { data: data?.data || [], pagination: data?.pagination || {} };
};

export const useCNByTender = (tenderId, params = {}) =>
  useQuery({
    queryKey: ["credit-notes-by-tender", tenderId, params],
    queryFn:  fetchCNByTender,
    enabled:  !!tenderId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Debit Notes by Tender ──────────────────────────────────────────────── */
const fetchDNByTender = async ({ queryKey }) => {
  const [, tenderId, params] = queryKey;
  const { data } = await api.get(`/debitnote/by-tender/${tenderId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return { data: data?.data || [], pagination: data?.pagination || {} };
};

export const useDNByTender = (tenderId, params = {}) =>
  useQuery({
    queryKey: ["debit-notes-by-tender", tenderId, params],
    queryFn:  fetchDNByTender,
    enabled:  !!tenderId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

/* ── Materials for a project/tender ─────────────────────────────────────── */
const fetchMaterials = async ({ queryKey }) => {
  const [, projectId] = queryKey;
  const { data } = await api.get(`/material/list/${projectId}`);
  return data?.data || [];
};

export const useMaterials = (projectId) =>
  useQuery({
    queryKey: ["project-materials", projectId],
    queryFn:  fetchMaterials,
    enabled:  !!projectId,
    staleTime: 5 * 60 * 1000,
  });
