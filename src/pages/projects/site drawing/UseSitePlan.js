import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { toast } from "react-toastify";

// --- Fetch documents ---
const fetchPlanDocuments = async ({ queryKey }) => {
  const [_, tender_id] = queryKey;
  const { data } = await api.get(`/sitedrawingdocs/alldocuments/${tender_id}`);
  return data.tender_document?.documents || [];
};

export const usePlanDocuments = (tender_id) =>
  useQuery({
    queryKey: ["plan-documents", tender_id],
    queryFn: fetchPlanDocuments,
    enabled: !!tender_id,
    // Don't retry on 404 — empty vault is a valid state
    retry: (count, error) => error.response?.status !== 404 && count < 1,
  });

// --- Upload plans ---
const uploadPlansApi = async ({ tender_id, uploaded_by, files, onUploadProgress }) => {
  const formData = new FormData();
  formData.append("tender_id", tender_id);
  formData.append("uploaded_by", uploaded_by);
  files.forEach((file) => formData.append("file", file));

  const endpoint = files.length === 1 ? "/sitedrawingdocs/upload" : "/sitedrawingdocs/upload-multiple";
  const { data } = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
};

// --- Delete document ---
export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ document_id }) => api.delete(`/sitedrawingdocs/${document_id}`),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["plan-documents"] });
    },
    onError: (err) => {
      toast.info(err.response?.data?.message || "On Development Phase.");
    },
  });
};

export const useUploadPlans = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPlansApi,
    onSuccess: () => {
      toast.success("Plans uploaded successfully ✅");
      queryClient.invalidateQueries({ queryKey: ["plan-documents"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Upload failed. Please try again.");
    },
  });
};
