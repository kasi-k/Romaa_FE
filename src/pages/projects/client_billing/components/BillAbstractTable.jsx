import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../../../constant";
import { Loader2 } from "lucide-react";

const BillAbstractTable = ({ tenderId, billId }) => {
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API}/clientbilling/api/details?tender_id=${tenderId}&bill_id=${billId}`
        );
        if (res.data.status || res.data.success) {
          setBillData(res.data.data);
        }
      } catch (err) {
        setError("Failed to load bill abstract.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (tenderId && billId) {
      fetchData();
    }
  }, [tenderId, billId]);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!billData) return <div className="p-4">No data found.</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatQty = (qty) => {
    return Number(qty).toFixed(3);
  };

  // --- COLUMN WIDTH CONFIGURATION (Matched to ComparativeTable) ---
  const WIDTHS = {
    sno: 50,
    desc: 350,
    unit: 60,
    rate: 100,
  };

  // Calculate cumulative left offsets
  const POS = {
    sno: 0,
    desc: WIDTHS.sno,
    unit: WIDTHS.sno + WIDTHS.desc,
    rate: WIDTHS.sno + WIDTHS.desc + WIDTHS.unit,
  };

  // Common Class for Fixed Header Cells (Exact match)
  const fixedHeaderClass =
    "px-3 py-2 border border-slate-600 bg-slate-800 text-white z-30 sticky top-0";
  
  // Common Class for Fixed Body Cells (Exact match)
  const fixedBodyClass =
    "px-3 py-2 border-r border-b dark:border-gray-700 bg-white dark:bg-gray-800 z-20 sticky left-0 group-hover:bg-blue-50 dark:group-hover:bg-gray-700";

  return (
    <div className="border shadow-sm bg-white dark:bg-gray-800 relative">
      {/* Container for scrolling (Exact match) */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-xs text-left border-collapse min-w-[2000px]">
          {/* --- Table Header (Same structure as ComparativeTable) --- */}
          <thead className="bg-slate-800 text-white uppercase font-semibold tracking-wider">
            <tr>
              {/* FIXED COLUMNS (Exact same as ComparativeTable) */}
              <th
                rowSpan="2"
                style={{ left: POS.sno, width: WIDTHS.sno }}
                className={`${fixedHeaderClass} text-center`}
              >
                S.No
              </th>
              <th
                rowSpan="2"
                style={{ left: POS.desc, width: WIDTHS.desc }}
                className={`${fixedHeaderClass}`}
              >
                Description
              </th>
              <th
                rowSpan="2"
                style={{ left: POS.unit, width: WIDTHS.unit }}
                className={`${fixedHeaderClass} text-center`}
              >
                Unit
              </th>
              <th
                rowSpan="2"
                style={{ left: POS.rate, width: WIDTHS.rate }}
                className={`${fixedHeaderClass} text-right border-r-2 border-r-slate-500 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.3)]`}
              >
                Agt Rate
              </th>

              {/* SCROLLABLE COLUMNS GROUP HEADERS */}
              <th colSpan="2" className="px-3 py-1 border border-slate-600 text-center bg-blue-900/50">
                Total Qty Upto Date
              </th>
              <th colSpan="3" className="px-3 py-1 border border-slate-600 text-center bg-gray-700">
                Deduct Previous Bill Amount
              </th>
              <th colSpan="3" className="px-3 py-1 border border-slate-600 text-center bg-indigo-900/50">
                Since Last Measurements
              </th>
              <th
                rowSpan="2"
                className="px-3 py-2 border border-slate-600 text-center bg-green-900/50 font-medium"
              >
                Agreement Qty
              </th>
            </tr>
            <tr>
              {/* Total Qty Upto Date */}
              {["Qty", "Value"].map((h) => (
                <th key={`upto-${h}`} className="px-2 py-2 border border-slate-600 text-right bg-blue-900/30 font-medium">
                  {h}
                </th>
              ))}
              
              {/* Deduct Previous Bill */}
              {["M.Bk/Pg", "Qty", "Amount"].map((h) => (
                <th key={`prev-${h}`} className="px-2 py-2 border border-slate-600 text-right bg-gray-700/50 font-medium">
                  {h}
                </th>
              ))}
              
              {/* Since Last Measurements */}
              {["Qty", "Unit", "Amount"].map((h) => (
                <th key={`curr-${h}`} className="px-2 py-2 border border-slate-600 text-right bg-indigo-900/30 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* --- Table Body (Same hover effects and structure) --- */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {billData.items.map((item, index) => (
              <tr key={index} className="group transition-colors hover:bg-blue-50 dark:hover:bg-gray-700">
                {/* --- FIXED COLUMNS (Exact same positioning and styling) --- */}
                <td
                  style={{ left: POS.sno, width: WIDTHS.sno }}
                  className={`${fixedBodyClass} text-center font-medium text-slate-500`}
                >
                  {item.item_code}
                </td>
                <td
                  style={{ left: POS.desc, width: WIDTHS.desc }}
                  className={`${fixedBodyClass} text-gray-800 dark:text-gray-200 font-medium break-words whitespace-normal`}
                >
                  {item.item_name}
                </td>
                <td
                  style={{ left: POS.unit, width: WIDTHS.unit }}
                  className={`${fixedBodyClass} text-center`}
                >
                  {item.unit}
                </td>
                <td
                  style={{ left: POS.rate, width: WIDTHS.rate }}
                  className={`${fixedBodyClass} text-right font-bold text-slate-700 dark:text-slate-300 border-r-2 !border-r-gray-300 dark:!border-r-gray-600 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)]`}
                >
                  {formatCurrency(item.rate)}
                </td>

                {/* --- SCROLLABLE COLUMNS --- */}
                {/* Total Qty Upto Date */}
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right text-gray-600 font-semibold bg-blue-50/10">
                  {formatQty(item.upto_date_qty)}
                </td>
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right text-blue-600">
                  {formatCurrency(item.upto_date_amount)}
                </td>

                {/* Deduct Previous Bill */}
                <td className="px-2 py-2 border-r dark:border-gray-700 text-center text-gray-500 text-xs">
                  {item.mb_book_ref ? item.mb_book_ref : "-"}
                </td>
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right text-gray-500">
                  {formatQty(item.prev_bill_qty)}
                </td>
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right text-gray-500 bg-gray-50/30">
                  {formatCurrency(item.prev_bill_amount)}
                </td>

                {/* Since Last Measurements (Current) */}
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right font-bold text-indigo-600 bg-indigo-50/30">
                  {formatQty(item.current_qty)}
                </td>
                <td className="px-2 py-2 border-r dark:border-gray-700 text-center text-xs uppercase text-gray-500 bg-indigo-50/30">
                  {item.unit}
                </td>
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right font-bold text-indigo-600 bg-indigo-50/30">
                  {formatCurrency(item.current_amount)}
                </td>

                {/* Agreement Qty */}
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right text-green-600 font-semibold bg-green-50/20">
                  {formatQty(item.agreement_qty)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* --- Footer — 13 columns: 4 fixed + 2 upto-date + 3 prev-bill + 3 current + 1 agreement --- */}
          <tfoot className="bg-slate-100 dark:bg-gray-900 font-bold border-t-2 border-slate-300 z-30 relative">
            <tr>
              {/* Fixed cols label (4) */}
              <td
                colSpan="4"
                className="px-4 py-3 text-right uppercase text-slate-700 dark:text-slate-300 border-r-2 border-gray-300 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)] sticky left-0 bg-slate-100 dark:bg-gray-900 z-20"
                style={{ left: 0, width: POS.rate + WIDTHS.rate }}
              >
                Total
              </td>
              {/* Total Upto Date: Qty (5) + Value (6) */}
              <td className="px-2 py-3 text-right text-blue-700">
                {formatQty(billData.items.reduce((s, i) => s + (i.upto_date_qty ?? 0), 0))}
              </td>
              <td className="px-2 py-3 text-right text-blue-700 font-semibold">
                {formatCurrency(billData.total_upto_date_amount)}
              </td>
              {/* Prev Bill: M.Bk/Pg (7) + Qty (8) + Amount (9) */}
              <td className="px-2 py-3" />
              <td className="px-2 py-3 text-right text-gray-500">
                {formatQty(billData.items.reduce((s, i) => s + (i.prev_bill_qty ?? 0), 0))}
              </td>
              <td className="px-2 py-3 text-right text-gray-500">
                {formatCurrency(billData.total_prev_bill_amount)}
              </td>
              {/* Since Last (Current): Qty (10) + Unit (11) + Amount (12) */}
              <td className="px-2 py-3 text-right text-indigo-700 font-bold">
                {formatQty(billData.items.reduce((s, i) => s + (i.current_qty ?? 0), 0))}
              </td>
              <td className="px-2 py-3" />
              <td className="px-2 py-3 text-right text-indigo-700 text-base font-bold">
                {formatCurrency(billData.grand_total)}
              </td>
              {/* Agreement Qty (13) — computed from items, field not in root response */}
              <td className="px-2 py-3 text-right text-green-700 font-semibold">
                {formatQty(billData.items.reduce((s, i) => s + (i.agreement_qty ?? 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BillAbstractTable;
