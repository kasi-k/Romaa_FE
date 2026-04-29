import React, { useMemo, useState, useCallback } from "react";
import { Search, Download, FileText, Layers } from "lucide-react";
import { useProject } from "../../../../context/ProjectContext";
import { useBOQProject } from "../../hooks/useProjects";

const W = { slno: 50, desc: 280, unit: 70, rate: 100, qty: 90, amt: 130 };
const L = { slno: 0, desc: W.slno, unit: W.slno + W.desc, rate: W.slno + W.desc + W.unit };

// Tailwind base classes
const TH = "border-r border-b border-slate-200 px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-100";
const TD = "border-r border-b border-slate-200 px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap tabular-nums";

// Separator shadow between fixed and scrollable zones
const SEP_L = { boxShadow: "4px 0 10px -4px rgba(0,0,0,0.12)" };

const BOQProject = () => {
  const { tenderId } = useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

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

  const { data: boqdata, isLoading: loading, isError } = useBOQProject(tenderId);

  const fmt = (num) => {
    const n = parseFloat(num);
    if (isNaN(n)) return "—";
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const headings = useMemo(() => (boqdata?.spent ? Object.keys(boqdata.spent) : []), [boqdata]);

  const grandTotal = useMemo(
    () => (boqdata?.billOfQty ?? []).reduce((s, r) => s + (parseFloat(r.total_amount) || 0), 0),
    [boqdata]
  );

  const filtered = useMemo(() => {
    if (!boqdata?.billOfQty) return [];
    const q = searchTerm.trim().toLowerCase();
    return q ? boqdata.billOfQty.filter((r) => r.item_name?.toLowerCase().includes(q)) : boqdata.billOfQty;
  }, [boqdata, searchTerm]);

  const handleExport = () => {
    if (!filtered.length) return;
    const headers = ["Sl.No", "Description", "Unit", "Rate"];
    headings.forEach((h) => headers.push(`${h} Qty`, `${h} Amount`));
    headers.push("Total Qty", "Total Amount");

    // Use plain "-" for null/undefined/zero — em dash garbles in Excel without BOM
    const ev = (val) => {
      if (val === null || val === undefined || val === "") return "-";
      const n = parseFloat(val);
      return isNaN(n) || n === 0 ? "-" : val;
    };

    const rows = filtered.map((r, i) => {
      const row = [i + 1, `"${(r.item_name ?? "").replace(/"/g, '""')}"`, r.unit || "-", ev(r.n_rate)];
      headings.forEach((h) => row.push(ev(r[`${h}quantity`]), ev(r[`${h}amount`])));
      row.push(ev(r.total_quantity), ev(r.total_amount));
      return row.join(",");
    });

    // \uFEFF BOM tells Excel to read as UTF-8 correctly
    const blob = new Blob(["\uFEFF" + [headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `BOQ_${tenderId || "Export"}.csv`;
    a.click();
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
              <div className="h-2.5 bg-slate-200 rounded w-2/5 mb-3" />
              <div className="h-5 bg-slate-200 rounded w-3/5" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
          <div className="h-9 bg-slate-100 border-b border-slate-200" />
          <div className="h-9 bg-slate-50 border-b border-slate-200" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 h-11 border-b border-slate-100 ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
              <div className="h-2.5 w-6 bg-slate-200 rounded" />
              <div className="h-2.5 w-52 bg-slate-200 rounded" />
              <div className="h-2.5 w-10 bg-slate-200 rounded" />
              <div className="h-2.5 w-16 bg-slate-200 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError || !boqdata || !Array.isArray(boqdata.billOfQty)) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="p-4 bg-slate-100 rounded-full mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-600">No BOQ data found</p>
        <p className="text-sm text-slate-400 mt-1">No bill of quantities is linked to this project.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Layers className="h-4 w-4 text-blue-500" />,    bg: "bg-blue-50",   label: "Line Items",   value: boqdata.billOfQty.length },
          { icon: <span className="text-emerald-500 font-bold text-sm">₹</span>, bg: "bg-emerald-50", label: "Grand Total", value: `₹ ${fmt(grandTotal)}` },
          { icon: <FileText className="h-4 w-4 text-violet-500" />, bg: "bg-violet-50", label: "Categories",  value: headings.length },
        ].map(({ icon, bg, label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`p-2 rounded-lg shrink-0 ${bg}`}>{icon}</div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{label}</p>
              <p className="text-lg font-bold text-slate-800 leading-tight mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
            />
          </div>
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{filtered.length}</span> / {boqdata.billOfQty.length} items
          </span>
        </div>
        <button
          onClick={handleExport}
          disabled={!filtered.length}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 shadow-sm overflow-scroll" style={{ maxHeight: "calc(100vh - 320px)" }}>
        <table className="border-collapse table-fixed" style={{ width: "max-content", minWidth: "100%" }}>

          {/* Column widths */}
          <colgroup>
            <col style={{ width: W.slno }} />
            <col style={{ width: W.desc }} />
            <col style={{ width: W.unit }} />
            <col style={{ width: W.rate }} />
            {headings.map((h) => (
              <React.Fragment key={h}>
                <col style={{ width: W.qty }} />
                <col style={{ width: W.amt }} />
              </React.Fragment>
            ))}
            <col style={{ width: W.qty }} />
            <col style={{ width: W.amt }} />
          </colgroup>

          {/* ── THEAD ─────────────────────────────────────────────────────── */}
          <thead className="sticky top-0 z-20">

            {/* Row 1 — group labels */}
            <tr>
              {/* Left-fixed base columns — rowSpan 2 */}
              <th rowSpan={2} className={`${TH} sticky z-22 text-center`} style={{ left: L.slno }}>
                Sl.
              </th>
              <th rowSpan={2} className={`${TH} sticky z-22 text-left`} style={{ left: L.desc }}>
                Description of Item
              </th>
              <th rowSpan={2} className={`${TH} sticky z-22 text-center`} style={{ left: L.unit }}>
                Unit
              </th>
              <th rowSpan={2} className={`${TH} sticky z-22 text-right`} style={{ left: L.rate, ...SEP_L }}>
                Rate
              </th>

              {/* Scrollable category group headers */}
              {headings.map((h) => (
                <th key={h} colSpan={2} className="border-r border-b border-blue-200 px-3 py-2.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap bg-blue-100 text-center">
                  {cap(h)}
                </th>
              ))}

              {/* Total group — end of scroll */}
              <th colSpan={2} className="border-r border-b border-emerald-200 border-l-2 border-l-emerald-300 px-3 py-2.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap bg-emerald-100 text-center">
                Total
              </th>
            </tr>

            {/* Row 2 — sub-labels */}
            <tr>
              {headings.map((h) => (
                <React.Fragment key={h}>
                  <th className="border-r border-b border-blue-200 px-3 py-2.5 text-[10px] font-semibold text-blue-500 bg-blue-50 text-center whitespace-nowrap">Qty</th>
                  <th className="border-r border-b border-blue-200 px-3 py-2.5 text-[10px] font-semibold text-blue-500 bg-blue-50 text-center whitespace-nowrap">Amount</th>
                </React.Fragment>
              ))}
              <th className="border-r border-b border-emerald-200 border-l-2 border-l-emerald-300 px-3 py-2.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 text-center whitespace-nowrap">Qty</th>
              <th className="border-r border-b border-emerald-200 px-3 py-2.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 text-center whitespace-nowrap">Amount</th>
            </tr>
          </thead>

          {/* ── TBODY ─────────────────────────────────────────────────────── */}
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4 + headings.length * 2 + 2} className="py-12 text-center text-sm text-slate-400">
                  No items match "<strong className="text-slate-600">{searchTerm}</strong>"
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const rowCls = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                return (
                  <tr key={item.id ?? idx} className={`group transition-colors hover:bg-sky-50 ${rowCls}`}>

                    {/* Sl.No — sticky left */}
                    <td
                      className={`${TD} sticky z-10 text-center text-slate-400 ${rowCls} group-hover:bg-sky-50`}
                      style={{ left: L.slno }}
                    >
                      {idx + 1}
                    </td>

                    {/* Description — sticky left, tooltip on truncation */}
                    <td
                      className={`${TD} sticky z-10 font-medium text-slate-800 truncate cursor-help ${rowCls} group-hover:bg-sky-50`}
                      style={{ left: L.desc, maxWidth: W.desc }}
                      onMouseEnter={(e) => handleTooltipEnter(e, item.item_name)}
                      onMouseMove={handleTooltipMove}
                      onMouseLeave={handleTooltipLeave}
                    >
                      {item.item_name}
                    </td>

                    {/* Unit — sticky left */}
                    <td
                      className={`${TD} sticky z-10 text-center text-slate-500 ${rowCls} group-hover:bg-sky-50`}
                      style={{ left: L.unit }}
                    >
                      {item.unit}
                    </td>

                    {/* Rate — sticky left, separator */}
                    <td
                      className={`${TD} sticky z-10 text-right ${rowCls} group-hover:bg-sky-50`}
                      style={{ left: L.rate, ...SEP_L }}
                    >
                      {fmt(item.n_rate)}
                    </td>

                    {/* Dynamic scrollable columns */}
                    {headings.map((h) => (
                      <React.Fragment key={h}>
                        <td className={`${TD} text-right text-slate-500`}>
                          {item[`${h}quantity`] ?? "—"}
                        </td>
                        <td className={`${TD} text-right`}>
                          {item[`${h}amount`] != null ? fmt(item[`${h}amount`]) : "—"}
                        </td>
                      </React.Fragment>
                    ))}

                    {/* Total Qty — end of scroll */}
                    <td className={`${TD} text-right text-slate-600 bg-emerald-50 border-l-2 border-l-emerald-300`}>
                      {item.total_quantity ?? "—"}
                    </td>

                    {/* Total Amount — end of scroll */}
                    <td className={`${TD} text-right font-semibold text-emerald-900 bg-emerald-50`}>
                      {fmt(item.total_amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* ── TFOOT ─────────────────────────────────────────────────────── */}
          <tfoot className="sticky bottom-0 z-20">
            <tr className="bg-slate-100 border-t-2 border-slate-300" style={{ boxShadow: "0 -3px 8px -3px rgba(0,0,0,0.10)" }}>

              {/* Sl.No */}
              <td className="border-r border-slate-200 bg-slate-100 sticky z-22" style={{ left: L.slno }} />

              {/* Grand Total label */}
              <td
                className="border-r border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wide bg-slate-100 sticky z-22 whitespace-nowrap"
                style={{ left: L.desc }}
              >
                Grand Total
              </td>

              {/* Unit */}
              <td className="border-r border-slate-200 bg-slate-100 sticky z-22" style={{ left: L.unit }} />

              {/* Rate */}
              <td className="border-r border-slate-200 bg-slate-100 sticky z-22" style={{ left: L.rate, ...SEP_L }} />

              {/* Dynamic totals */}
              {headings.map((h) => (
                <React.Fragment key={h}>
                  <td className="border-r border-blue-100 bg-blue-50" />
                  <td className="border-r border-blue-100 px-3 py-2.5 text-right text-xs font-bold text-blue-700 tabular-nums bg-blue-50">
                    {fmt(boqdata.spent?.[h])}
                  </td>
                </React.Fragment>
              ))}

              {/* Total Qty footer */}
              <td className="border-r border-emerald-200 bg-emerald-100 border-l-2 border-l-emerald-300" />

              {/* Total Amount footer */}
              <td className="border-r border-emerald-200 px-3 py-3.5 text-right text-sm font-bold text-emerald-900 tabular-nums bg-emerald-100">
                {fmt(grandTotal)}
              </td>
            </tr>
          </tfoot>

        </table>
      </div>
      {tooltip.visible && (
        <div
          className="fixed z-9999 pointer-events-none px-3 py-2 text-xs font-medium text-white bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700 max-w-xs whitespace-normal wrap-break-word leading-relaxed"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: `translate(
              ${tooltip.x > window.innerWidth - 300 ? "calc(-100% - 15px)" : "15px"},
              ${tooltip.y > window.innerHeight - 100 ? "calc(-100% - 15px)" : "15px"}
            )`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default BOQProject;
