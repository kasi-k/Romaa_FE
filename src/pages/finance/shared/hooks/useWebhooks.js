import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "finance-webhooks";

export const useWebhookSubscriptions = () =>
  useQuery({
    queryKey: [QK],
    queryFn: async () => {
      const { data } = await api.get("/finance/webhooks");
      return data?.data || [];
    },
    staleTime: 60_000,
  });

export const useCreateWebhookSubscription = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.post("/finance/webhooks", payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Webhook subscription created");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to create subscription")),
  });
};

export const useDeleteWebhookSubscription = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/finance/webhooks/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Subscription removed");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to delete")),
  });
};
