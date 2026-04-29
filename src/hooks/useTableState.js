import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * useTableState — drop-in replacement for the three useState calls in every
 * Table page. Keeps currentPage and filterParams in the URL so the state
 * survives tab switches, back/forward navigation, and page refreshes.
 *
 * Usage (swap the three useState lines in any page):
 *
 *   const { currentPage, setCurrentPage, filterParams, setFilterParams }
 *     = useTableState("tenders");   // unique key per table
 *
 * Deep-link example: /tender/tenders?tenders_page=3&tenders_from=2026-01-01
 *
 * Multiple tables on the same page are safe because each key is prefixed.
 *
 * @param {string} tableKey  Unique identifier scoped to this table.
 *                           Use the route name or resource name (e.g. "tenders").
 */
export const useTableState = (tableKey = "table") => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageKey = `${tableKey}_page`;
  const fromKey = `${tableKey}_from`;
  const toKey   = `${tableKey}_to`;

  // ── Initialize from URL (one-time lazy init) ────────────────────────────────
  // Because useState initializer only runs on mount, the URL is the source of
  // truth: the component will always boot with whatever is in the URL, even
  // after a tab switch that causes an unmount/remount cycle.
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get(pageKey) || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const [filterParams, setFilterParams] = useState(() => ({
    fromdate: searchParams.get(fromKey) || "",
    todate:   searchParams.get(toKey)   || "",
  }));

  // ── Sync state → URL (single batched write after all state settles) ─────────
  // Using useEffect means React batches all synchronous state updates before
  // this fires, so setFilterParams + setCurrentPage(1) in the same tick produce
  // exactly ONE history.replaceState call — no race conditions.
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        if (currentPage > 1) next.set(pageKey, String(currentPage));
        else                  next.delete(pageKey);

        if (filterParams?.fromdate) next.set(fromKey, filterParams.fromdate);
        else                        next.delete(fromKey);

        if (filterParams?.todate) next.set(toKey, filterParams.todate);
        else                      next.delete(toKey);

        return next;
      },
      { replace: true }
    );
  }, [currentPage, filterParams?.fromdate, filterParams?.todate]); // eslint-disable-line react-hooks/exhaustive-deps

  return { currentPage, setCurrentPage, filterParams, setFilterParams };
};
