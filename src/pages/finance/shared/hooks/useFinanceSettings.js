import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "finance-settings";

export const useFinanceSettings = () =>
  useQuery({
    queryKey: [QK],
    queryFn: async () => {
      const { data } = await api.get("/finance/settings");
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateFinanceSetting = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }) =>
      api
        .put(`/finance/settings/${encodeURIComponent(key)}`, { value })
        .then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Setting updated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to update setting")),
  });
};
