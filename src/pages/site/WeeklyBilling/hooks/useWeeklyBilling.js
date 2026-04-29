import {
  useQuery,
  useMutation,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// ── List all generated bills for a tender ──────────────────────────────────────
const fetchBillingList = async (tenderId, params) => {
  const { data } = await api.get(`/weeklybilling/api/list/${tenderId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });

  return data || [];
};

export const useWeeklyBillingList = (tenderId, queryParams = {}) =>
  useQuery({
    queryKey: ["weekly-billing-list", tenderId, queryParams],
    queryFn: () => fetchBillingList(tenderId, queryParams),
    enabled: !!tenderId,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

// ── All contractors linked to this site/tender ─────────────────────────────────────
const fetchSiteContractors = async (tenderId) => {
  const { data } = await api.get(`/contractor/getbytender/${tenderId}`);
  return data?.data || [];
};

export const useSiteContractors = (tenderId) =>
  useQuery({
    queryKey: ["billing-site-contractors", tenderId],
    queryFn: () => fetchSiteContractors(tenderId),
    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000,
  });

// ── Contractor work-done summary for a date range ──────────────────────────────────
// Returns contractors with their aggregated work done items between fromDate..toDate
const fetchContractorSummary = async (tenderId, fromDate, toDate) => {
  const { data } = await api.get(
    `/weeklybilling/api/contractor-summary/${tenderId}`,
    { params: { fromDate, toDate } },
  );
  return data?.data || [];
};

export const useContractorWorkSummary = (tenderId, fromDate, toDate) =>
  useQuery({
    queryKey: ["billing-contractor-summary", tenderId, fromDate, toDate],
    queryFn: () => fetchContractorSummary(tenderId, fromDate, toDate),
    enabled: !!tenderId && !!fromDate && !!toDate,
    staleTime: 30 * 1000,
  });

// ── Sub-bill transactions ──────────────────────────────────────────────────────
const fetchSubBillTransactions = async (subBillNo) => {
  const { data } = await api.get(
    `/weeklybilling/api/sub-bill/${encodeURIComponent(subBillNo)}`,
  );
  return data?.data || null;
};

export const useSubBillTransactions = (subBillNo) =>
  useQuery({
    queryKey: ["weekly-sub-bill", subBillNo],
    queryFn: () => fetchSubBillTransactions(subBillNo),
    enabled: !!subBillNo,
    staleTime: 30 * 1000,
  });

// ── Bill detail (with transactions) ───────────────────────────────────────────
const fetchBillDetail = async (billNo) => {
  const { data } = await api.get(
    `/weeklybilling/api/detail/${encodeURIComponent(billNo)}`,
  );
  return data?.data || null;
};

export const useWeeklyBillingDetail = (billNo) =>
  useQuery({
    queryKey: ["weekly-billing-detail", billNo],
    queryFn: () => fetchBillDetail(billNo),
    enabled: !!billNo,
    staleTime: 30 * 1000,
  });

// ── Update bill status (Pending / Cancelled) ───────────────────────────────────
export const useUpdateBillStatus = (tenderId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, status }) =>
      api.patch(`/weeklybilling/api/status/${billId}`, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Bill status updated to ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["weekly-billing-list", tenderId] });
      qc.invalidateQueries({ queryKey: ["weekly-billing-detail"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });
};

// ── Approve bill (dedicated endpoint — posts ledger entry) ─────────────────────
export const useApproveBill = (tenderId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (billId) =>
      api.patch(`/weeklybilling/api/approve/${billId}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Bill approved and posted to ledger");
      qc.invalidateQueries({ queryKey: ["weekly-billing-list", tenderId] });
      qc.invalidateQueries({ queryKey: ["weekly-billing-detail"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to approve bill");
    },
  });
};

// ── Generate a bill ────────────────────────────────────────────────────────────
export const useGenerateBill = ({ onSuccess, onClose }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/weeklybilling/api/generate", payload),
    onSuccess: (_, vars) => {
      toast.success("Bill generated successfully!");
      qc.invalidateQueries({
        queryKey: ["weekly-billing-list", vars.tender_id],
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to generate bill");
    },
  });
};
