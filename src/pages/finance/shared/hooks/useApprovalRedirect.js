import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isApprovalRequired } from "../../../../services/api";

/**
 * Returns an onError handler that, when the server answers 400 APPROVAL_REQUIRED,
 * navigates the user to the approvals inbox with a helpful toast. Other errors
 * fall through to the provided `fallback` handler (typically another onError).
 *
 * Usage:
 *   const onError = useApprovalAwareErrorHandler("Failed to approve bill");
 *   const approve = useApprovePurchaseBill({ onError });
 */
export const useApprovalAwareErrorHandler = (fallbackMsg = "Action failed") => {
  const navigate = useNavigate();
  return (err) => {
    if (isApprovalRequired(err)) {
      toast.info("This amount exceeds the approval threshold — redirected to the approval queue.");
      navigate("/finance/approvals");
      return;
    }
    const msg = err?.response?.data?.message || fallbackMsg;
    toast.error(msg);
  };
};
