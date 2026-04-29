import axios from 'axios';
const API = "http://localhost:8000"
// const API = "https://api.maarrsmart.com"

export const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send HTTP-only auth cookies with every request
});

/* RFC-4122 v4 UUID — used as default X-Idempotency-Key on POST */
const uuidv4 = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

/* Attach X-Idempotency-Key to every POST unless the caller already set one */
api.interceptors.request.use((config) => {
  const method = (config.method || "").toLowerCase();
  if (method === "post") {
    const hasKey =
      config.headers?.["X-Idempotency-Key"] || config.headers?.["x-idempotency-key"];
    if (!hasKey) {
      config.headers = config.headers || {};
      config.headers["X-Idempotency-Key"] = uuidv4();
    }
  }
  return config;
});

// Session expired — clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Skip auto-logout for notification polling — let the caller handle it
    const isNotificationReq = url.startsWith("/notification");

    if (status === 401 && window.location.pathname !== "/" && !isNotificationReq) {
      localStorage.removeItem("crm_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

/* Map a Finance API error to a human-readable string.
   Handles VALIDATION_FAILED's errors[] array and the documented error_code enum. */
export const extractApiError = (err, fallback = "Something went wrong") => {
  const body = err?.response?.data;
  if (!body) return err?.message || fallback;

  if (body.error_code === "VALIDATION_FAILED" && Array.isArray(body.errors) && body.errors.length) {
    return body.errors
      .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
      .join(" • ");
  }

  switch (body.error_code) {
    case "APPROVAL_REQUIRED":
      return body.message || "Amount exceeds approval threshold — request queued for approver.";
    case "VERSION_CONFLICT":
      return "Another user updated this record. Reload and try again.";
    case "IDEMPOTENCY_CONFLICT":
      return "Duplicate submission detected. Reload and try again.";
    case "BALANCE_MISMATCH":
      return "Debits and credits don't balance — please recheck amounts.";
    case "RCM_GST_CONFLICT":
      return "Reverse Charge bills must have zero GST on all lines.";
    case "CURRENCY_NOT_FOUND":
      return "Currency code not found in master — add it first.";
    case "EXCHANGE_RATE_MISSING":
      return "No exchange rate for the selected date — add a rate first.";
    case "LEDGER_SEAL_BROKEN":
      return "Ledger seal chain broken — contact finance admin.";
    case "RATE_LIMIT_EXCEEDED": {
      const retry = err?.response?.headers?.["retry-after"];
      return retry
        ? `Too many requests — retry in ${retry}s.`
        : "Too many requests — please wait and retry.";
    }
    case "INSUFFICIENT_PERMISSION":
      return "You don't have permission to perform this action.";
    case "DUPLICATE_ENTRY":
      return body.message || "This record already exists.";
    case "INVALID_TRANSITION":
      return body.message || "That status change isn't allowed.";
    case "NOT_FOUND":
      return body.message || "Record not found.";
    default:
      return body.message || fallback;
  }
};

/* Distinguish the "approval required" case from a real error. */
export const isApprovalRequired = (err) =>
  err?.response?.status === 400 && err?.response?.data?.error_code === "APPROVAL_REQUIRED";
