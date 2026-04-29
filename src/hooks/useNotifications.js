import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

// --- Fetch functions ---

const fetchMyNotifications = async ({ queryKey }) => {
  const [_, params] = queryKey;
  const { data } = await api.get("/notification/my", { params });
  return data.data;
};

const fetchUnreadCount = async () => {
  try {
    const { data } = await api.get("/notification/unread-count");
    return data.data;
  } catch (err) {
    // Silently fail — don't let notification API trigger logout
    if (err.response?.status === 401) return { unread: 0 };
    throw err;
  }
};

// --- Query hooks ---

export const useMyNotifications = (params = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: fetchMyNotifications,
    enabled: false, // only fetch when panel is opened via refetch()
  });
};

export const useUnreadCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notification-unread-count"],
    queryFn: fetchUnreadCount,
    enabled: !!user,
    refetchInterval: user ? 30000 : false,
    refetchIntervalInBackground: false,
    staleTime: 15000,
    retry: false,
  });
};

// --- Mutation hooks ---

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/notification/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notification/read-all"),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });
};

export const useDismissNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/notification/${id}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
  });
};
