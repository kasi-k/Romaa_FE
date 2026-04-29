import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../services/api";
import { toast } from "react-toastify";

// ==========================================
// 1. Fetch ALL Projects (For Dropdowns, etc.)
// ==========================================
const fetchAllProjects = async () => {
  const { data } = await api.get("/tender/all");
  return data?.data || []; // Ensure it always returns an array
};

export const useAllProjects = () => {
  return useQuery({
    queryKey: ["all-projects"], // Unique key for caching
    queryFn: fetchAllProjects,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });
};

// ==========================================
// 2. Fetch PAGINATED Projects (For Tables)
// ==========================================
const fetchProjects = async ({ queryKey }) => {
  const [_, params] = queryKey;

  const { data } = await api.get("/tender/gettendersworkorder", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });

  return data;
};

export const useProjects = (queryParams) => {
  return useQuery({
    queryKey: ["projects", queryParams],
    queryFn: fetchProjects,
    placeholderData: keepPreviousData, // Keeps table stable while loading next page
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};

// BOQ Cost

const fetchZeroCostItems = async ({ queryKey }) => {
  const [_, tenderId, params] = queryKey;

  const { data } = await api.get(`/boq/items/${tenderId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });

  return data;
};

export const useZeroCostItems = (tenderId, queryParams) => {
  return useQuery({
    // Include tenderId in the queryKey so it refetches automatically when the project changes
    queryKey: ["zero-cost-items", tenderId, queryParams],
    queryFn: fetchZeroCostItems,
    enabled: !!tenderId, // ONLY run the query if a tenderId is actually selected
    placeholderData: keepPreviousData, // Keeps table UI stable while loading the next page
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};

// Detailed Estimate
//Headings:
const fetchDetailedHeadings = async ({ queryKey }) => {
  const [_, tenderId] = queryKey;

  const { data } = await api.get(`/detailedestimate/extractheadings`, {
    params: { tender_id: tenderId },
  });

  return data?.data || [];
};

export const useDetailedEstimateHeadings = (tenderId) => {
  return useQuery({
    queryKey: ["detailed-estimate-headings", tenderId],
    queryFn: fetchDetailedHeadings,
    enabled: !!tenderId, // Only fetch if a project is selected
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
// General Abstract

const fetchGeneralAbstract = async ({ queryKey }) => {
  const [_, tenderId] = queryKey;
  const { data } = await api.get(`/detailedestimate/getgeneralabstract`, {
    params: { tender_id: tenderId },
  });
  return data?.data || [];
};

export const useGeneralAbstract = (tenderId) => {
  return useQuery({
    queryKey: ["general-abstract", tenderId],
    queryFn: fetchGeneralAbstract,
    enabled: !!tenderId, // Only fetch if a tenderId exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Bill of Qty

const fetchBOQData = async ({ queryKey }) => {
  const [_, tenderId] = queryKey;

  const { data } = await api.get(`/detailedestimate/getbillofqty`, {
    params: { tender_id: tenderId },
  });

  return data?.data || null;
};

export const useBOQProject = (tenderId) => {
  return useQuery({
    queryKey: ["boq-project", tenderId],
    queryFn: fetchBOQData,
    enabled: !!tenderId, // Prevent API calls if no project is selected
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Abstract

const fetchNewInletAbs = async ({ queryKey }) => {
  const [_, tenderId, name] = queryKey;

  const { data } = await api.get(`/detailedestimate/getdatacustomhead`, {
    params: {
      tender_id: tenderId,
      nametype: name,
    },
  });

  return data?.data || [];
};

export const useNewInletAbs = (tenderId, name) => {
  return useQuery({
    queryKey: ["new-inlet-abs", tenderId, name],
    queryFn: fetchNewInletAbs,
    enabled: !!tenderId && !!name, // Only run if BOTH tenderId and name are present
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// detail

const fetchNewInletDet = async ({ queryKey }) => {
  const [_, tenderId, name] = queryKey;

  const { data } = await api.get(`/detailedestimate/getdatacustomhead`, {
    params: {
      tender_id: tenderId,
      nametype: name,
    },
  });

  return data?.data || [];
};

export const useNewInletDet = (tenderId, name) => {
  return useQuery({
    queryKey: ["new-inlet-det", tenderId, name],
    queryFn: fetchNewInletDet,
    enabled: !!tenderId && !!name, // Only run if BOTH are present
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Drawing vs BOQ

// --- 1. Query: Fetch Drawing BOQ ---
const fetchDrawingBoq = async ({ queryKey }) => {
  const [_, tenderId] = queryKey;
  const { data } = await api.get(`/boq/get-drawing-quantity/${tenderId}`);

  // Ensure numeric fields are numbers before returning
  return (data?.data || []).map((item) => ({
    ...item,
    quantity: Number(item.quantity) || 0,
    n_rate: Number(item.n_rate) || 0,
    drawing_quantity: Number(item.drawing_quantity) || 0,
    variable_quantity: Number(item.variable_quantity) || 0,
    variable_amount: Number(item.variable_amount) || 0,
  }));
};

export const useDrawingBoq = (tenderId) => {
  return useQuery({
    queryKey: ["drawing-boq", tenderId],
    queryFn: fetchDrawingBoq,
    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// --- 2. Mutation: Save Drawing BOQ ---
const updateDrawingBoq = async ({ tenderId, payload }) => {
  const { data } = await api.put(
    `/boq/bulk-update-drawing-quantity/${tenderId}`,
    payload,
  );
  return data;
};

export const useUpdateDrawingBoq = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDrawingBoq,
    onSuccess: (data, variables) => {
      // Invalidate the cache to trigger a fresh fetch automatically
      queryClient.invalidateQueries(["drawing-boq", variables.tenderId]);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Failed to save changes", error);
      toast.error(error.response?.data?.message || "Failed to save changes");
    },
  });
};

// Work Order Request => Create Enquiry

// --- 1. Fetch Permitted Contractors ---
export const usePermittedContractors = (tenderId) => {
  return useQuery({
    queryKey: ["permitted-contractors", tenderId],
    queryFn: async () => {
      const { data } = await api.get(`/contractor/getbytender/${tenderId}`);
      return data?.data || [];
    },

    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
};

// --- 2. Fetch Allowed Quantities ---
export const useAllowedQuantities = (tenderId) => {
  return useQuery({
    queryKey: ["allowed-quantities", tenderId],
    queryFn: async () => {
      const { data } = await api.get(
        `/raquantities/quantites/allowed/${tenderId}/contractor`,
      );
     return Array.isArray(data?.data?.data) ? data.data.data : [];
    },
    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
};

// --- 3. Submit Work Order Request ---
export const useCreateWorkOrderRequest = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/workorderrequest/api/create`, payload);
      return data;
    },
  });
};

// Work Order Request => ViewWORequest.jsx
// --- 1. Fetch Request Details ---
export const useWORequestDetails = (projectId, requestId, options = {}) => {
  return useQuery({
    queryKey: ["wo-request", projectId, requestId],
    queryFn: async () => {
      const { data } = await api.get(
        `/workorderrequest/api/getQuotationRequested/${projectId}/${requestId}`,
      );
      return Array.isArray(data?.data) ? data.data[0] : data?.data;
    },
    enabled: !!projectId && !!requestId,
    staleTime: 0,        // Always consider stale so back-navigation triggers a refetch
    refetchOnMount: true,
    ...options,
  });
};

// --- 2. Mutation: Approve/Reject Quotation ---
export const useRespondToQuotation = (projectId, requestId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quotationId, actionType }) => {
      const endpoint =
        actionType === "Approved"
          ? `/workorderrequest/api/workorder-requests/${requestId}/approve-contractor`
          : `/workorderrequest/api/workorder-requests/${requestId}/reject-contractor`;

      const { data } = await api.put(endpoint, { quotationId });
      return data;
    },
    onSuccess: () => {
      // Invalidate the cache to ensure the server truth is fetched in the background
      queryClient.invalidateQueries(["wo-request", projectId, requestId]);
    },
  });
};

// Work Order Request => WORequest.jsx

// --- 1. Fetch Work Order Requests ---
export const useWORequests = (projectId) => {
  return useQuery({
    queryKey: ["wo-requests", projectId],
    queryFn: async () => {
      const { data } = await api.get(
        `/workorderrequest/api/getbyIdNewRequest/${projectId}`,
      );
      return data?.data || [];
    },
    // The select function formats the data right after fetching, keeping your component clean
    select: (data) =>
      data.map((item) => ({
        ...item, // Keep the rest of the original data just in case
        requestId: item.requestId,
        requestDate: item.requestDate
          ? new Date(item.requestDate).toLocaleDateString("en-GB")
          : "-",
        projectId: item.projectId,
        tender_project_name: item.tender_project_name,
        tender_name: item.tender_name,
        requiredByDate: item.requiredByDate
          ? new Date(item.requiredByDate).toLocaleDateString("en-GB")
          : "-",
        siteIncharge: item.siteDetails?.siteIncharge || "N/A",
        status: item.status,
      })),
    enabled: !!projectId, // Only run if a projectId exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Work Order Request => WorkOrderRequestForm.jsx

// --- 1. Fetch Work Order Request Details ---
export const useWorkOrderRequestDetails = (tenderId, requestId) => {
  return useQuery({
    queryKey: ["wo-request-details", tenderId, requestId],
    queryFn: async () => {
      const { data } = await api.get(
        `/workorderrequest/api/getdetailbyId/${tenderId}/${requestId}`,
      );
      return data?.data || {};
    },
    enabled: !!tenderId && !!requestId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// --- 2. Submit Vendor Quotation ---
export const useSubmitVendorQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workOrderRequestId, payload }) => {
      const { data } = await api.post(
        `/workorderrequest/api/workorder-requests/${workOrderRequestId}/contractor-quotation`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      // Refresh WO request list so status moves from "Awaiting Quotes" → "Quotes Ready"
      queryClient.invalidateQueries({ queryKey: ["wo-requests"] });
      queryClient.invalidateQueries({ queryKey: ["wo-request"] });
    },
  });
};

// Work Order Request => WorkOrderIssuance.jsx

export const useQuotationApprovedRequests = (projectId, queryParams = {}) => {
  return useQuery({
    queryKey: ["wo-approved-requests", projectId, queryParams],
    queryFn: async () => {
      const { data } = await api.get(
        `/workorderrequest/api/getbyIdQuotationApproved/${projectId}`,
        {
          params: {
            page: queryParams.page,
            limit: queryParams.limit,
            search: queryParams.search,
            fromdate: queryParams.fromdate,
            todate: queryParams.todate,
            ...(queryParams.approval_type ? { approval_type: queryParams.approval_type } : {}),
          },
        },
      );
      return data; // full response: { status, currentPage, totalPages, totalCount, counts, data }
    },
    enabled: !!projectId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};
