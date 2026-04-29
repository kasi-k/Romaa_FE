import { useQuery, useMutation } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "finance-bulk";

/* Download CSV template for a module — triggers browser download */
export const downloadBulkTemplate = async (module) => {
  const res = await api.get(`/finance/bulk/${module}/template`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${module}-template.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/* Import — multipart/form-data. Returns { job_id } (202 Accepted) */
export const useBulkImport = ({ onSuccess } = {}) =>
  useMutation({
    mutationFn: ({ module, file }) => {
      const fd = new FormData();
      fd.append("file", file);
      return api
        .post(`/finance/bulk/${module}/import`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Import queued");
      if (onSuccess) onSuccess(data);
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Import failed")),
  });

/* Poll import job — stops polling once status is completed/failed */
export const useBulkImportJob = (jobId) =>
  useQuery({
    queryKey: [QK, "job", jobId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/bulk/jobs/${jobId}`);
      return data?.data;
    },
    enabled: !!jobId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      if (s === "completed" || s === "failed") return false;
      return 2000;
    },
  });

/* Export — triggers file download (Excel by default, CSV optional) */
export const downloadBulkExport = async (module, params = {}) => {
  const res = await api.get(`/finance/bulk/${module}/export`, {
    params,
    responseType: "blob",
  });
  const ext = params.format === "csv" ? "csv" : "xlsx";
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${module}-export.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
