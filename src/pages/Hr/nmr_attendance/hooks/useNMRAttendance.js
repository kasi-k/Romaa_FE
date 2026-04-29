import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// --- List (no attendance_list) ---
const fetchNMRAttendanceList = async ({ queryKey }) => {
  const [, projectId, params] = queryKey;
  const { data } = await api.get(`/nmrattendance/api/list/${projectId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
      contractor_id: params.contractor_id || undefined,
    },
  });
  return data;
};

export const useNMRAttendanceList = (projectId, params = {}) => {
  return useQuery({
    queryKey: ["nmr-attendance-list", projectId, params],
    queryFn: fetchNMRAttendanceList,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    enabled: !!projectId,
  });
};

// --- Details (with attendance_list) ---
const fetchNMRAttendanceDetails = async ({ queryKey }) => {
  const [, id] = queryKey;
  const { data } = await api.get(`/nmrattendance/api/details/${id}`);
  return data;
};

export const useNMRAttendanceDetails = (id) => {
  return useQuery({
    queryKey: ["nmr-attendance-details", id],
    queryFn: fetchNMRAttendanceDetails,
    staleTime: 30 * 1000,
    enabled: !!id,
  });
};

// --- Update (PUT) - SUBMITTED only ---
export const useUpdateNMRAttendance = ({ id, onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/nmrattendance/api/update/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Attendance updated successfully");
      queryClient.invalidateQueries({ queryKey: ["nmr-attendance-details", id] });
      queryClient.invalidateQueries({ queryKey: ["nmr-attendance-list"] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update attendance");
    },
  });
};

// --- Approve (PATCH) ---
export const useApproveNMRAttendance = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, verified_by }) => {
      const { data } = await api.patch(`/nmrattendance/api/approve/${id}`, { verified_by });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Attendance approved successfully");
      queryClient.invalidateQueries({ queryKey: ["nmr-attendance-details", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["nmr-attendance-list"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve attendance");
    },
  });
};
