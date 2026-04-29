import { useEffect, useRef } from "react";

/**
 * Capture the server-assigned `_version` off a fetched record and keep it
 * reactive. Useful in edit forms so PATCH payloads can round-trip `_version`
 * per the optimistic-locking contract (guide §1).
 *
 * Usage:
 *   const { data: bill } = usePurchaseBill(id);
 *   const versionRef = useVersioned(bill?._version);
 *   // on submit:
 *   update.mutate({ id, ...formValues, _version: versionRef.current });
 */
export const useVersioned = (version) => {
  const ref = useRef(version ?? 0);
  useEffect(() => {
    if (typeof version === "number") ref.current = version;
  }, [version]);
  return ref;
};
