import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../services/api";

const QK = "finance-dropdown";

/* Bank + cash accounts (combined). type: "bank" | "cash" | undefined */
export const useFinanceBankAccounts = (type) =>
  useQuery({
    queryKey: [QK, "bank-accounts", type],
    queryFn: async () => {
      const { data } = await api.get("/finance-dropdown/bank-accounts", {
        params: type ? { type } : {},
      });
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useFinanceBankOnly = () =>
  useQuery({
    queryKey: [QK, "bank-only"],
    queryFn: async () => {
      const { data } = await api.get("/finance-dropdown/bank-only");
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useFinanceCashOnly = () =>
  useQuery({
    queryKey: [QK, "cash-only"],
    queryFn: async () => {
      const { data } = await api.get("/finance-dropdown/cash-only");
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

/* Approved + unpaid bills that can be settled via a payment voucher */
export const usePayableBills = (params = {}) =>
  useQuery({
    queryKey: [QK, "payable-bills", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/finance-dropdown/payable-bills", { params: p });
      return data?.data || [];
    },
    staleTime: 60_000,
  });

export const usePayableBillsVendor = (params = {}) =>
  useQuery({
    queryKey: [QK, "payable-bills-vendor", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/finance-dropdown/payable-bills/vendor", { params: p });
      return data?.data || [];
    },
    staleTime: 60_000,
  });

export const usePayableBillsContractor = (params = {}) =>
  useQuery({
    queryKey: [QK, "payable-bills-contractor", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/finance-dropdown/payable-bills/contractor", { params: p });
      return data?.data || [];
    },
    staleTime: 60_000,
  });

/* Parties (vendor|contractor|client) linked to a tender */
export const useTenderParties = (tenderId, type) =>
  useQuery({
    queryKey: [QK, "parties", tenderId, type],
    queryFn: async () => {
      const { data } = await api.get(`/finance-dropdown/parties/${tenderId}`, {
        params: type ? { type } : {},
      });
      return data?.data || [];
    },
    enabled: !!tenderId,
    staleTime: 60_000,
  });
