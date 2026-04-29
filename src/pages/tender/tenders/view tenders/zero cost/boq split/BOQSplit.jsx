import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import axios from "axios";
import { API } from "../../../../../../constant";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

// --- HELPERS & CONFIG ---
const formatNumber = (num) => {
  if (num === undefined || num === null || num === "") return "-";
  const n = Number(num);
  if (Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};

// Defined column widths for precise sticky positioning
const WIDTHS = { sl: 50, id: 90, item: 200, desc: 280, unit: 60, qty: 80 };

const getStickyStyle = (colName, type = "body") => {
  let left = 0;
  if (colName === "id") left = WIDTHS.sl;
  if (colName === "item") left = WIDTHS.sl + WIDTHS.id;
  if (colName === "desc") left = WIDTHS.sl + WIDTHS.id + WIDTHS.item;
  if (colName === "unit") left = WIDTHS.sl + WIDTHS.id + WIDTHS.item + WIDTHS.desc;
  if (colName === "qty") left = WIDTHS.sl + WIDTHS.id + WIDTHS.item + WIDTHS.desc + WIDTHS.unit;

  let zIndex = 30;
  if (type === "header") zIndex = 70;
  if (type === "footer") zIndex = 80;

  return {
    position: "sticky",
    left: `${left}px`,
    zIndex,
    width: `${WIDTHS[colName]}px`,
    minWidth: `${WIDTHS[colName]}px`,
    maxWidth: `${WIDTHS[colName]}px`,
  };
};

// --- CSS CONSTANTS ---
const cellBase = "border-r border-b border-slate-200 px-3 py-2 text-right tabular-nums whitespace-nowrap text-slate-600";
const stickyCellBase = "border-r border-b border-slate-200 px-3 py-2 sticky bg-white group-hover:bg-slate-50 transition-colors align-top shadow-[1px_0_0_0_#e2e8f0]";
const headerBase = "border-r border-b border-slate-300 px-3 py-2 font-bold uppercase tracking-wider text-center text-[10px]";

// --- SUB-COMPONENTS ---

const VarianceBadge = memo(({ value, isPercent = false, type = "cost" }) => {
  const num = Number(value);
  
  if (isNaN(num)) return <span className="text-slate-400 font-medium">-</span>;
  if (num === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold tracking-wide bg-slate-50 text-slate-500 border-slate-200">
        0.00{isPercent ? "%" : ""}
      </span>
    );
  }
  
  const isPositive = num > 0;
  const isGood = type === "cost" ? !isPositive : isPositive; 

  const bgColor = isGood 
    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
    : "bg-rose-50 text-rose-700 border-rose-200";
    
  const arrow = isPositive ? "↑" : "↓";

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold tracking-wide ${bgColor}`}>
      {formatNumber(Math.abs(num))}{isPercent ? "%" : ""} {arrow}
    </span>
  );
});

const StatCard = memo(({ label, value, color, suffix = "" }) => (
  <div className="relative overflow-hidden bg-white shadow-sm border border-slate-200 rounded-lg flex items-center p-3 hover:shadow-md transition-shadow">
    <div className={`absolute left-0 top-0 w-1.5 h-full bg-${color}-500`}></div>
    <div className="pl-3 w-full flex flex-col md:flex-row md:items-center md:justify-between">
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg font-extrabold text-slate-800 tabular-nums">
        {formatNumber(value)}{suffix}
      </p>
    </div>
  </div>
));

const BOQTableRow = memo(({ it, idx, onMouseEnter, onMouseMove, onMouseLeave, onFocus }) => {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td style={getStickyStyle("sl")} className={`${stickyCellBase} text-center text-slate-400 font-medium`}>{idx + 1}</td>
      
      {/* ITEM ID COLUMN */}
      <td style={getStickyStyle("id")} className={`${stickyCellBase} text-center text-slate-500 font-mono text-[10px] tracking-wide`}>
        {it.item_id || "-"}
      </td>

      <td 
        style={getStickyStyle("item")} 
        className={`${stickyCellBase} font-semibold text-slate-800 truncate cursor-help outline-none focus:bg-indigo-50`}
        tabIndex={0}
        onMouseEnter={(e) => onMouseEnter(e, it.item_name)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onFocus={(e) => onFocus(e, it.item_name)}
        onBlur={onMouseLeave}
      >
        {it.item_name}
      </td>
      
      <td 
        style={getStickyStyle("desc")} 
        className={`${stickyCellBase} truncate cursor-help outline-none focus:bg-indigo-50`}
        tabIndex={0}
        onMouseEnter={(e) => onMouseEnter(e, it.description)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onFocus={(e) => onFocus(e, it.description)}
        onBlur={onMouseLeave}
      >
        {it.description}
      </td>
      
      <td style={getStickyStyle("unit")} className={`${stickyCellBase} text-center text-slate-500`}>{it.unit}</td>
      <td style={getStickyStyle("qty")} className={`${stickyCellBase} font-extrabold text-slate-800 border-r-[3px] border-r-slate-400 bg-slate-50/30`}>
        {formatNumber(it.quantity)}
      </td>

      <td className={`${cellBase} bg-sky-50/30`}>{formatNumber(it.n_rate)}</td>
      <td className={`${cellBase} bg-sky-50/50 font-medium text-slate-800`}>{formatNumber(it.n_amount)}</td>
      
      <td className={`${cellBase} bg-indigo-50/30`}>{formatNumber(it.final_rate)}</td>
      <td className={`${cellBase} bg-indigo-50/50 font-bold text-indigo-800`}>{formatNumber(it.final_amount)}</td>

      <td className={cellBase}>{formatNumber(it.consumable_material_rate)}</td>
      <td className={`${cellBase} text-slate-800`}>{formatNumber(it.consumable_material_amount)}</td>
      <td className={cellBase}>{formatNumber(it.bulk_material_rate)}</td>
      <td className={`${cellBase} text-slate-800`}>{formatNumber(it.bulk_material_amount)}</td>

      <td className={cellBase}>{formatNumber(it.machinery_rate)}</td>
      <td className={`${cellBase} text-slate-800`}>{formatNumber(it.machinery_amount)}</td>
      <td className={cellBase}>{formatNumber(it.fuel_rate)}</td>
      <td className={`${cellBase} text-slate-800`}>{formatNumber(it.fuel_amount)}</td>

      <td className={cellBase}>{formatNumber(it.contractor_rate)}</td>
      <td className={`${cellBase} text-slate-800`}>{formatNumber(it.contractor_amount)}</td>
      <td className={cellBase}>{formatNumber(it.nmr_rate)}</td>
      <td className={`${cellBase} text-slate-800`}>{formatNumber(it.nmr_amount)}</td>

      <td className={`${cellBase} bg-slate-50/50`}><VarianceBadge value={it.variance_amount} /></td>
      <td className={`${cellBase} bg-slate-50/50`}><VarianceBadge value={it.variance_percentage} isPercent={true} /></td>
    </tr>
  );
});

// --- MAIN DASHBOARD COMPONENT ---
const BOQSplit = () => {
  const { tender_id } = useParams();
  const [boq, setBoq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [varianceFilter, setVarianceFilter] = useState("all"); 
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  useEffect(() => {
    const fetchBoqSplit = async () => {
      if (!tender_id) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API}/boq/get-items/${tender_id}`);
        setBoq(res.data.data || null);
      } catch {
        toast.error("Failed to fetch BOQ items");
      } finally {
        setLoading(false);
      }
    };
    fetchBoqSplit();
  }, [tender_id]);

  const processedItems = useMemo(() => {
    let items = boq?.items || [];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(it => 
        (it.item_id && String(it.item_id).toLowerCase().includes(lowerSearch)) ||
        (it.item_name && it.item_name.toLowerCase().includes(lowerSearch)) ||
        (it.description && it.description.toLowerCase().includes(lowerSearch))
      );
    }

    if (varianceFilter !== "all") {
      items = items.filter(it => {
        const v = Number(it.variance_amount) || 0;
        if (varianceFilter === "variances") return v !== 0;
        if (varianceFilter === "overruns") return v > 0;
        if (varianceFilter === "savings") return v < 0;  
        return true;
      });
    }

    if (sortConfig.key) {
      items = [...items].sort((a, b) => {
        const aValue = Number(a[sortConfig.key]) || 0;
        const bValue = Number(b[sortConfig.key]) || 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [boq, searchTerm, varianceFilter, sortConfig]);

  const filteredTotals = useMemo(() => {
    if (!processedItems.length) return null;
    
    const isFiltered = searchTerm !== "" || varianceFilter !== "all";
    if (!isFiltered) return null;

    const totals = processedItems.reduce((acc, item) => {
      acc.boq_total += Number(item.n_amount) || 0;
      acc.zero_cost += Number(item.final_amount) || 0;
      acc.consumable += Number(item.consumable_material_amount) || 0;
      acc.bulk += Number(item.bulk_material_amount) || 0;
      acc.machinery += Number(item.machinery_amount) || 0;
      acc.fuel += Number(item.fuel_amount) || 0;
      acc.contractor += Number(item.contractor_amount) || 0;
      acc.nmr += Number(item.nmr_amount) || 0;
      acc.variance += Number(item.variance_amount) || 0;
      return acc;
    }, {
      boq_total: 0, zero_cost: 0, consumable: 0, bulk: 0, 
      machinery: 0, fuel: 0, contractor: 0, nmr: 0, variance: 0
    });

    totals.variance_percentage = totals.boq_total !== 0 
      ? (totals.variance / totals.boq_total) * 100 
      : 0;

    return totals;
  }, [processedItems, searchTerm, varianceFilter]);

  const handleTooltipEnter = useCallback((e, text) => {
    if (!text) return;
    setTooltip({ visible: true, text, x: e.clientX, y: e.clientY });
  }, []);

  const handleTooltipMove = useCallback((e) => {
    setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
  }, []);

  const handleTooltipLeave = useCallback(() => {
    setTooltip({ visible: false, text: "", x: 0, y: 0 });
  }, []);

  const handleFocus = useCallback((e, text) => {
    if (!text) return;
    const rect = e.target.getBoundingClientRect();
    setTooltip({ visible: true, text, x: rect.right + 10, y: rect.top });
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleExportCSV = () => {
    if (!processedItems.length) {
      toast.info("No data to export.");
      return;
    }

    const headers = [
      "Sl No", "Item ID", "Item Name", "Description", "Unit", "Qty", 
      "BOQ Rate", "BOQ Amount", 
      "Zero-Cost Target Rate", "Zero-Cost Target Amount", 
      "Consumable Mat. Rate", "Consumable Mat. Amount",
      "Bulk Mat. Rate", "Bulk Mat. Amount",
      "Machinery Rate", "Machinery Amount",
      "Fuel Rate", "Fuel Amount",
      "Contractor Rate", "Contractor Amount",
      "NMR Rate", "NMR Amount",
      "Variance Amount", "Variance %"
    ];

    const csvRows = processedItems.map((it, idx) => [
      idx + 1,
      `"${it.item_id || ""}"`,
      `"${(it.item_name || "").replace(/"/g, '""')}"`,
      `"${(it.description || "").replace(/"/g, '""')}"`,
      `"${it.unit || ""}"`,
      it.quantity || 0,
      it.n_rate || 0, it.n_amount || 0,
      it.final_rate || 0, it.final_amount || 0,
      it.consumable_material_rate || 0, it.consumable_material_amount || 0,
      it.bulk_material_rate || 0, it.bulk_material_amount || 0,
      it.machinery_rate || 0, it.machinery_amount || 0,
      it.fuel_rate || 0, it.fuel_amount || 0,
      it.contractor_rate || 0, it.contractor_amount || 0,
      it.nmr_rate || 0, it.nmr_amount || 0,
      it.variance_amount || 0,
      it.variance_percentage || 0
    ]);

    csvRows.push(Array(headers.length).fill(""));

    if (filteredTotals) {
      csvRows.push([
        "", "", `"Filtered Subtotals (${processedItems.length} items)"`, "", "", "", 
        "", filteredTotals.boq_total, 
        "", filteredTotals.zero_cost, 
        "", filteredTotals.consumable, 
        "", filteredTotals.bulk, 
        "", filteredTotals.machinery, 
        "", filteredTotals.fuel, 
        "", filteredTotals.contractor, 
        "", filteredTotals.nmr, 
        filteredTotals.variance, 
        filteredTotals.variance_percentage
      ]);
    }

    if (boq) {
      csvRows.push([
        "", "", `"Project Grand Total"`, "", "", "", 
        "", boq.boq_total_amount || 0, 
        "", boq.zero_cost_total_amount || 0, 
        "", boq.consumable_material || 0, 
        "", boq.bulk_material || 0, 
        "", boq.machinery || 0, 
        "", boq.fuel || 0, 
        "", boq.contractor || 0, 
        "", boq.nmr || 0, 
        boq.variance_amount || 0, 
        boq.variance_percentage || 0
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BOQ_Variance_Analysis_${tender_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex h-48 w-full items-center justify-center rounded-xl bg-slate-50 text-slate-500 font-medium animate-pulse">Analyzing BOQ Data...</div>;
  if (!boq || !boq.items || boq.items.length === 0) return <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-500">No BOQ split data found.</div>;

  return (
    <div className="w-full flex flex-col gap-3 p-2">
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="BOQ Total" value={boq.boq_total_amount} color="sky" />
        <StatCard label="Zero-Cost Target" value={boq.zero_cost_total_amount} color="indigo" />
        <StatCard label="Total Variance" value={boq.variance_amount} color={boq.variance_amount > 0 ? "rose" : "emerald"} />
        <StatCard label="Variance %" value={boq.variance_percentage} color={boq.variance_amount > 0 ? "rose" : "emerald"} suffix="%" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <input 
            type="text" 
            placeholder="Search Item ID, names or descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-xs px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={varianceFilter}
            onChange={(e) => setVarianceFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">View: All Items</option>
            <option value="variances">Only Items with Variances</option>
            <option value="overruns">⚠️ Cost Overruns Only (Red)</option>
            <option value="savings">✅ Cost Savings Only (Green)</option>
          </select>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-md text-sm font-bold hover:bg-emerald-100 transition-colors shadow-sm w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      <div className="relative overflow-auto rounded-xl shadow-sm border border-slate-300 max-h-[70vh] bg-white">
        <table className="border-separate border-spacing-0 text-[11px] w-full">
          <thead className="sticky top-0 z-[60] bg-slate-100 shadow-sm">
            <tr className="text-slate-700">
              <th rowSpan={2} style={getStickyStyle("sl", "header")} className={`${headerBase} bg-slate-200`}>#</th>
              <th rowSpan={2} style={getStickyStyle("id", "header")} className={`${headerBase} bg-slate-200`}>Item ID</th>
              <th rowSpan={2} style={getStickyStyle("item", "header")} className={`${headerBase} text-left bg-slate-200`}>Item Name</th>
              <th rowSpan={2} style={getStickyStyle("desc", "header")} className={`${headerBase} text-left bg-slate-200`}>Description</th>
              <th rowSpan={2} style={getStickyStyle("unit", "header")} className={`${headerBase} bg-slate-200`}>Unit</th>
              <th rowSpan={2} style={getStickyStyle("qty", "header")} className={`${headerBase} bg-slate-200 border-r-[3px] border-r-slate-400`}>Qty</th>
              
              <th colSpan={2} className={`${headerBase} bg-sky-50 text-sky-800`}>BOQ Reference</th>
              <th colSpan={2} className={`${headerBase} bg-indigo-50 text-indigo-800`}>Zero-Cost Budget</th>
              <th colSpan={4} className={`${headerBase} bg-emerald-50 text-emerald-800`}>Materials (Cons/Bulk)</th>
              <th colSpan={4} className={`${headerBase} bg-amber-50 text-amber-800`}>Machinery / Fuel</th>
              <th colSpan={4} className={`${headerBase} bg-violet-50 text-violet-800`}>Labor (Contractor/NMR)</th>
              <th colSpan={2} className={`${headerBase} bg-slate-200 text-slate-800 border-b-slate-300`}>Variance Analysis</th>
            </tr>
            <tr className="bg-slate-50 text-slate-600">
              {Array(8).fill(["Rate", "Amt"]).flat().map((label, i) => <th key={i} className={headerBase}>{label}</th>)}
              
              <th 
                onClick={() => handleSort('variance_amount')}
                className={`${headerBase} bg-slate-100 text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors group`}
                title="Sort by Variance Amount"
              >
                <div className="flex items-center justify-center gap-1">
                  Amt
                  <span className="text-[9px] text-slate-400 group-hover:text-slate-600">
                    {sortConfig.key === 'variance_amount' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                onClick={() => handleSort('variance_percentage')}
                className={`${headerBase} bg-slate-100 text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors group`}
                title="Sort by Variance Percentage"
              >
                <div className="flex items-center justify-center gap-1">
                  %
                  <span className="text-[9px] text-slate-400 group-hover:text-slate-600">
                    {sortConfig.key === 'variance_percentage' ? (sortConfig.direction === 'desc' ? '▼' : '▲') : '↕'}
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {processedItems.length === 0 ? (
              <tr>
                <td colSpan={24} className="text-center py-8 text-slate-500 font-medium">No items match your selected filters.</td>
              </tr>
            ) : (
              processedItems.map((it, idx) => (
                <BOQTableRow 
                  key={it.item_id || idx} 
                  it={it} 
                  idx={idx} 
                  onMouseEnter={handleTooltipEnter}
                  onMouseMove={handleTooltipMove}
                  onMouseLeave={handleTooltipLeave}
                  onFocus={handleFocus}
                />
              ))
            )}
          </tbody>

          <tfoot className="sticky bottom-0 z-[60] shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.1)]">
            
            {filteredTotals && (
              <tr className="bg-slate-700 text-slate-200 font-semibold tracking-wide border-b border-slate-600">
                <td colSpan={6} style={getStickyStyle("sl", "footer")} className="px-4 py-2 bg-slate-700 border-r-[3px] border-r-slate-500 text-right uppercase text-[10px] w-full max-w-none text-indigo-200">
                  Filtered Subtotals ({processedItems.length} items)
                </td>
                
                {[filteredTotals.boq_total, filteredTotals.zero_cost, filteredTotals.consumable, filteredTotals.bulk, filteredTotals.machinery, filteredTotals.fuel, filteredTotals.contractor, filteredTotals.nmr].map((val, i) => (
                  <React.Fragment key={`sub_${i}`}>
                    <td className="px-2 py-2 border-r border-slate-600/50"></td>
                    <td className="px-2 py-2 border-r border-slate-600/50 text-right">{formatNumber(val)}</td>
                  </React.Fragment>
                ))}

                <td className="px-2 py-2 border-r border-slate-600/50 text-right bg-slate-700">
                  <VarianceBadge value={filteredTotals.variance} />
                </td>
                <td className="px-2 py-2 text-right bg-slate-700">
                  <VarianceBadge value={filteredTotals.variance_percentage} isPercent={true} />
                </td>
              </tr>
            )}

            <tr className="bg-slate-900 text-white font-bold tracking-wide">
              <td colSpan={6} style={getStickyStyle("sl", "footer")} className="px-4 py-3 bg-slate-900 border-r-[3px] border-r-slate-600 text-right uppercase text-[11px] w-full max-w-none shadow-[0_-1px_0_0_#475569]">
                Project Grand Total
              </td>
              
              {[boq.boq_total_amount, boq.zero_cost_total_amount, boq.consumable_material, boq.bulk_material, boq.machinery, boq.fuel, boq.contractor, boq.nmr].map((val, i) => (
                <React.Fragment key={`grand_${i}`}>
                  <td className="px-2 py-3 border-r border-slate-700/80"></td>
                  <td className="px-2 py-3 border-r border-slate-700/80 text-right text-[13px]">{formatNumber(val)}</td>
                </React.Fragment>
              ))}

              <td className="px-2 py-3 border-r border-slate-700 text-right bg-slate-950"><VarianceBadge value={boq.variance_amount} /></td>
              <td className="px-2 py-3 text-right bg-slate-950"><VarianceBadge value={boq.variance_percentage} isPercent={true} /></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {tooltip.visible && (
        <div 
          className="fixed z-[9999] pointer-events-none px-3 py-2 text-xs font-medium text-white bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700 max-w-xs whitespace-normal break-words leading-relaxed"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: `translate(
              ${tooltip.x > window.innerWidth - 300 ? 'calc(-100% - 15px)' : '15px'}, 
              ${tooltip.y > window.innerHeight - 150 ? 'calc(-100% - 15px)' : '15px'}
            )`
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default BOQSplit;