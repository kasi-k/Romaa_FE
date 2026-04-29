import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, extractApiError } from "../../../../services/api";

const KEY = {
  list: "asset-categories",
  grouped: "asset-categories-grouped",
  detail: "asset-category-detail",
};

export const useAssetCategoryList = (params = {}) =>
  useQuery({
    queryKey: [KEY.list, params],
    queryFn: async () => {
      const { data } = await api.get("/assetcategory/getall", {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          assetClass: params.assetClass,
          isActive: params.isActive,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useAssetCategoryGrouped = () =>
  useQuery({
    queryKey: [KEY.grouped],
    queryFn: async () => {
      const { data } = await api.get("/assetcategory/grouped");
      return data?.data || data || {};
    },
    staleTime: 5 * 60 * 1000,
  });

export const useAssetCategoryDetail = (id) =>
  useQuery({
    queryKey: [KEY.detail, id],
    queryFn: async () => {
      const { data } = await api.get(`/assetcategory/getbyid/${id}`);
      return data?.data || null;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: [KEY.list] });
  qc.invalidateQueries({ queryKey: [KEY.grouped] });
};

export const useCreateAssetCategory = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/assetcategory/", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Category created");
      invalidateAll(qc);
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to create category")),
  });
};

export const useUpdateAssetCategory = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/assetcategory/update/${id}`, payload);
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Category updated");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, vars.id] });
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to update category")),
  });
};

export const useToggleAssetCategoryStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/assetcategory/toggle-status/${id}`);
      return data;
    },
    onSuccess: (data, id) => {
      toast.success(data?.message || "Status updated");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to toggle status")),
  });
};

export const useDeleteAssetCategory = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/assetcategory/delete/${id}`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Category deleted");
      invalidateAll(qc);
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to delete category")),
  });
};

export const useSeedAssetCategories = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/assetcategory/seed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Defaults seeded");
      invalidateAll(qc);
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to seed defaults")),
  });
};
