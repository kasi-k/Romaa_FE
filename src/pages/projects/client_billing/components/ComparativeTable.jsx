import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../../../constant";
import { Loader2 } from "lucide-react";

const ComparativeTable = ({ tenderId, billId }) => {
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
        setError("Failed to load billing details.");
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

  const formatPercent = (val) => {
    if (!val || Number(val) === 0) return 0;
    return Number(val).toFixed(2) + "%";
  };

  // --- COLUMN WIDTH CONFIGURATION ---
  const WIDTHS = {
    sno: 50,
    desc: 350,
    unit: 60,
    rate: 100,
  };

  // Calculate cumulative left offsets for sticky columns
  const POS = {
    sno: 0,
    desc: WIDTHS.sno,
    unit: WIDTHS.sno + WIDTHS.desc,
    rate: WIDTHS.sno + WIDTHS.desc + WIDTHS.unit,
  };

  const fixedHeaderClass =
    "px-3 py-2 border border-slate-600 bg-slate-800 text-white z-30 sticky top-0";
  
  const fixedBodyClass =
    "px-3 py-2 border-r border-b dark:border-gray-700 bg-white dark:bg-gray-800 z-20 sticky left-0 group-hover:bg-blue-50 dark:group-hover:bg-gray-700";

  return (
    <div className="border shadow-sm bg-white dark:bg-gray-800 relative">
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-xs text-left border-collapse min-w-[2200px]">
          {/* --- Table Header --- */}
          <thead className="bg-slate-800 text-white uppercase font-semibold tracking-wider">
            <tr>
              {/* FIXED COLUMNS */}
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
                Rate
              </th>

              {/* SCROLLABLE GROUPS */}
              <th colSpan="2" className="px-3 py-1 border border-slate-600 text-center bg-blue-900/50">Agreement</th>
              <th colSpan="2" className="px-3 py-1 border border-slate-600 text-center bg-green-900/50">As Per Execution</th>
              <th colSpan="3" className="px-3 py-1 border border-slate-600 text-center bg-red-900/50">Excess</th>
              <th colSpan="3" className="px-3 py-1 border border-slate-600 text-center bg-yellow-900/50">Balance</th>
            </tr>
            <tr>
              {/* SUB-HEADERS */}
              {["Qty", "Amount"].map((h) => <th key={`agt-${h}`} className="px-2 py-2 border border-slate-600 text-right bg-blue-900/30 font-medium">{h}</th>)}
              {["Qty", "Amount"].map((h) => <th key={`upto-${h}`} className="px-2 py-2 border border-slate-600 text-right bg-green-900/30 font-medium">{h}</th>)}
              
              {/* Excess Sub-headers */}
              {["Qty", "Amount", "%"].map((h) => <th key={`exc-${h}`} className="px-2 py-2 border border-slate-600 text-right bg-red-900/30 font-medium">{h}</th>)}
              
              {/* Balance Sub-headers */}
              {["Qty", "Amount", "%"].map((h) => <th key={`bal-${h}`} className="px-2 py-2 border border-slate-600 text-right bg-yellow-900/30 font-medium">{h}</th>)}
            </tr>
          </thead>

          {/* --- Table Body --- */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {billData.items.map((item, index) => (
              <tr key={index} className="group transition-colors hover:bg-blue-50 dark:hover:bg-gray-700">
                
                {/* --- FIXED COLUMNS --- */}
                <td style={{ left: POS.sno, width: WIDTHS.sno }} className={`${fixedBodyClass} text-center font-medium text-slate-500`}>
                  {item.item_code}
                </td>
                <td style={{ left: POS.desc, width: WIDTHS.desc }} className={`${fixedBodyClass} text-gray-800 dark:text-gray-200 font-medium break-words whitespace-normal`}>
                  {item.item_name}
                </td>
                <td style={{ left: POS.unit, width: WIDTHS.unit }} className={`${fixedBodyClass} text-center`}>
                  {item.unit}
                </td>
                <td style={{ left: POS.rate, width: WIDTHS.rate }} className={`${fixedBodyClass} text-right font-bold text-slate-700 dark:text-slate-300 border-r-2 !border-r-gray-300 dark:!border-r-gray-600 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                  {formatCurrency(item.rate)}
                </td>

                {/* --- SCROLLABLE COLUMNS --- */}
                
                {/* Agreement */}
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right text-gray-600">{formatQty(item.agreement_qty)}</td>
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right text-gray-600">{formatCurrency(item.agreement_amount)}</td>

                {/* As Per Execution */}
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right font-semibold text-blue-600 bg-blue-50/10">{formatQty(item.upto_date_qty)}</td>
                <td className="px-2 py-2 border-r dark:border-gray-700 text-right font-semibold text-blue-600 bg-blue-50/10">{formatCurrency(item.upto_date_amount)}</td>

                {/* Excess */}
                <td className={`px-2 py-2 border-r dark:border-gray-700 text-right ${item.excess_qty > 0 ? 'text-red-600 font-bold bg-red-50/30' : 'text-gray-300'}`}>
                  {item.excess_qty > 0 ? formatQty(item.excess_qty) : 0}
                </td>
                <td className={`px-2 py-2 border-r dark:border-gray-700 text-right ${item.excess_amount > 0 ? 'text-red-600 font-bold bg-red-50/30' : 'text-gray-300'}`}>
                  {item.excess_amount > 0 ? formatCurrency(item.excess_amount) : 0}
                </td>
                {/* DIRECT DB MAPPING for Excess Percentage */}
                <td className={`px-2 py-2 border-r dark:border-gray-700 text-right font-mono text-xs ${item.excess_percentage > 0 ? 'text-red-700 bg-red-50/30' : 'text-gray-300'}`}>
                  {formatPercent(item.excess_percentage)}
                </td>

                {/* Balance */}
                <td className={`px-2 py-2 border-r dark:border-gray-700 text-right ${item.balance_qty > 0 ? 'text-yellow-600' : 'text-gray-300'}`}>
                  {item.balance_qty > 0 ? formatQty(item.balance_qty) : 0}
                </td>
                <td className={`px-2 py-2 border-r dark:border-gray-700 text-right ${item.balance_amount > 0 ? 'text-yellow-600' : 'text-gray-300'}`}>
                  {item.balance_amount > 0 ? formatCurrency(item.balance_amount) : 0}
                </td>
                {/* DIRECT DB MAPPING for Balance Percentage */}
                <td className={`px-2 py-2 text-right font-mono text-xs ${item.balance_percentage > 0 ? 'text-yellow-700' : 'text-gray-300'}`}>
                  {formatPercent(item.balance_percentage)}
                </td>

              </tr>
            ))}
          </tbody>

          {/* --- Footer (Grand Total) --- */}
          <tfoot className="bg-slate-100 dark:bg-gray-900 font-bold border-t-2 border-slate-300 z-30 relative">
            <tr>
              {/* Fixed cols: S.No + Description + Unit + Rate = 4 */}
              <td
                colSpan="4"
                className="px-4 py-3 text-right uppercase text-slate-700 dark:text-slate-300 border-r-2 border-gray-300 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)] sticky left-0 bg-slate-100 dark:bg-gray-900 z-20"
                style={{ left: 0, width: POS.rate + WIDTHS.rate }}
              >
                Total
              </td>
              {/* Agreement: Qty + Amount (cols 5-6) */}
              <td className="px-2 py-3 text-right text-gray-600">
                {formatQty(billData.items.reduce((s, i) => s + (i.agreement_qty ?? 0), 0))}
              </td>
              <td className="px-2 py-3 text-right text-gray-600">
                {formatCurrency(billData.items.reduce((s, i) => s + (i.agreement_amount ?? 0), 0))}
              </td>
              {/* As Per Execution: Qty + Amount (cols 7-8) */}
              <td className="px-2 py-3 text-right text-blue-700">
                {formatQty(billData.items.reduce((s, i) => s + (i.upto_date_qty ?? 0), 0))}
              </td>
              <td className="px-2 py-3 text-right text-blue-700 text-base">
                {formatCurrency(billData.total_upto_date_amount)}
              </td>
              {/* Excess (3) + Balance (3) = 6 cols — empty */}
              <td colSpan="6" className="px-2 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ComparativeTable;