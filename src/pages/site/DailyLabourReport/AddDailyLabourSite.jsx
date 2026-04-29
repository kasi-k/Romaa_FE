import { useState, useEffect, useRef, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { FiSave, FiClipboard, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { useContractorsDropdownTenderWise } from "../../Hr/contract & Nmr/hooks/useContractors";
import { useContractorEmployees, useCreateBulkDLP, useBOQItems } from "./hooks/useDailyLabourReport";
import { useProject } from "../../../context/ProjectContext";
import SearchableSelect from "../../../components/SearchableSelect";

const UNITS = ["CUM", "SQM", "RMT", "NOS", "KG", "MT", "LS"];

const emptyAttendance = (emp, wageMap) => ({
  worker_id: emp.worker_id,
  worker_name: emp.employee_name,
  category: emp.role,
  daily_wage: wageMap[emp.role] ?? emp.daily_wage ?? 0,
  status: "PRESENT",
  in_time: "",
  out_time: "",
  remark: "",
  
});

const emptyWorkEntry = () => ({
  id: Date.now() + Math.random(),
  description: "",
  category: "",
  unit: "CUM",
  l: "", b: "", h: "",
  quantity: "",
  remark: "",
});

// ─── Validation ──────────────────────────────────────────────────────────────

const validate = (reportDate, sections) => {
  const errs = { reportDate: "", sections: {} };
  let valid = true;

  if (!reportDate) { errs.reportDate = "Date is required"; valid = false; }

  sections.forEach((s) => {
    const sErr = { contractorId: "", workEntries: {} };
    if (!s.contractorId) { sErr.contractorId = "Select a contractor"; valid = false; }
    s.workEntries.forEach((e, idx) => {
      if (!e.description.trim()) {
        sErr.workEntries[idx] = { description: "Required" };
        valid = false;
      }
    });
    errs.sections[s.sectionId] = sErr;
  });

  return { errs, valid };
};

// ─── Root form ───────────────────────────────────────────────────────────────

const AddDailyLabourSite = ({ onclose, onSuccess }) => {
  const { tenderId } = useProject();
  const { data: contractors = [] } = useContractorsDropdownTenderWise(tenderId);
  const { data: boqItems = [], isLoading: boqLoading } = useBOQItems(tenderId);
  const { mutateAsync: submitBulk, isPending: loading } = useCreateBulkDLP({ onSuccess, onclose });

  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [sections, setSections] = useState([
    { sectionId: Date.now(), contractorId: "", remark: "", attendance: [], workEntries: [] },
  ]);
  const [errors, setErrors] = useState({ reportDate: "", sections: {} });

  const clearFieldError = (path) =>
    setErrors((prev) => ({ ...prev, [path]: "" }));

  const clearSectionError = (sectionId, field) =>
    setErrors((prev) => ({
      ...prev,
      sections: { ...prev.sections, [sectionId]: { ...(prev.sections[sectionId] || {}), [field]: "" } },
    }));

  const clearWorkEntryError = (sectionId, idx) =>
    setErrors((prev) => {
      const sec = prev.sections[sectionId] || {};
      const we = { ...(sec.workEntries || {}) };
      delete we[idx];
      return { ...prev, sections: { ...prev.sections, [sectionId]: { ...sec, workEntries: we } } };
    });

  const addSection = () =>
    setSections((prev) => [
      ...prev,
      { sectionId: Date.now(), contractorId: "", remark: "", attendance: [], workEntries: [] },
    ]);

  const removeSection = (id) => setSections((prev) => prev.filter((s) => s.sectionId !== id));

  const updateContractor = (id, contractorId) => {
    setSections((prev) => prev.map((s) => s.sectionId === id ? { ...s, contractorId, attendance: [], workEntries: [] } : s));
    clearSectionError(id, "contractorId");
  };

  const updateRemark = (id, remark) =>
    setSections((prev) => prev.map((s) => s.sectionId === id ? { ...s, remark } : s));

  const updateAttendance = (id, attendance) =>
    setSections((prev) => prev.map((s) => s.sectionId === id ? { ...s, attendance } : s));

  const updateAttendanceRow = (sectionId, idx, field, value) =>
    setSections((prev) =>
      prev.map((s) => {
        if (s.sectionId !== sectionId) return s;
        const att = [...s.attendance];
        att[idx] = { ...att[idx], [field]: value };
        return { ...s, attendance: att };
      })
    );

  const addWorkEntry = (sectionId) =>
    setSections((prev) =>
      prev.map((s) => s.sectionId === sectionId ? { ...s, workEntries: [...s.workEntries, emptyWorkEntry()] } : s)
    );

  const updateWorkEntry = (sectionId, idx, field, value) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.sectionId !== sectionId) return s;
        const we = [...s.workEntries];
        we[idx] = { ...we[idx], [field]: value };
        return { ...s, workEntries: we };
      })
    );
    if (field === "description") clearWorkEntryError(sectionId, idx);
  };

  const removeWorkEntry = (sectionId, idx) =>
    setSections((prev) =>
      prev.map((s) =>
        s.sectionId === sectionId ? { ...s, workEntries: s.workEntries.filter((_, i) => i !== idx) } : s
      )
    );

  const usedContractorIds = sections.map((s) => s.contractorId).filter(Boolean);

  const totals = useMemo(() => {
    let manDays = 0; let amount = 0;
    sections.forEach((s) =>
      s.attendance.forEach((a) => {
        const w = parseFloat(a.daily_wage) || 0;
        if (a.status === "PRESENT") { manDays += 1; amount += w; }
        else if (a.status === "HALF_DAY") { manDays += 0.5; amount += w / 2; }
        else if (a.status === "QUARTER_DAY") { manDays += 0.25; amount += w /4; }
      })
    );
    return { manDays, amount };
  }, [sections]);

  const handleSubmit = async () => {
    if (!tenderId) return toast.error("No project selected");
    const { errs, valid } = validate(reportDate, sections);
    setErrors(errs);
    if (!valid) { toast.error("Please fix the highlighted errors"); return; }

    const filled = sections.filter((s) => s.contractorId);
    if (!filled.length) return toast.error("Add at least one contractor");

    const reports = filled.map((s) => ({
      report_date: reportDate,
      project_id: tenderId,
      contractor_id: s.contractorId,
      remark: s.remark,
      attendance_entries: s.attendance.map((a) => ({
        worker_id: a.worker_id,
        worker_name: a.worker_name,
        category: a.category,
        status: a.status,
        daily_wage: parseFloat(a.daily_wage) || 0,
        ...(a.in_time && { in_time: a.in_time }),
        ...(a.out_time && { out_time: a.out_time }),
        ...(a.remark && { remark: a.remark }),
      })),
      work_entries: s.workEntries
        .filter((e) => e.description.trim())
        .map((e) => {
          const catAtt = s.attendance.filter((a) => a.category === e.category);
          const totalHeads = catAtt.reduce((sum, a) => {
            if (a.status === "PRESENT") return sum + 1;
            if (a.status === "HALF_DAY") return sum + 0.5;
            if (a.status === "QUARTER_DAY") return sum + 0.25;
            return sum;
          }, 0);
          const totalAmount = catAtt.reduce((sum, a) => {
            const w = parseFloat(a.daily_wage) || 0;
            if (a.status === "PRESENT") return sum + w;
            if (a.status === "HALF_DAY") return sum + w / 2;
            if (a.status === "QUARTER_DAY") return sum + w / 4;
            return sum;
          }, 0);
          return {
            description: e.description,
            category: e.category,
            unit: e.unit,
            totalHeads,
            totalAmount,
            ...(e.l !== "" && { l: parseFloat(e.l) }),
            ...(e.b !== "" && { b: parseFloat(e.b) }),
            ...(e.h !== "" && { h: parseFloat(e.h) }),
            ...(e.quantity !== "" && { quantity: parseFloat(e.quantity) }),
            ...(e.remark && { remark: e.remark }),
            
          };
        }),
    }));

    await submitBulk({ reports });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiClipboard /></span>
              Daily Labour Report
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 ml-11">Attendance + Work Progress</p>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">

          {/* Global fields */}
          <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date" value={reportDate}
                onChange={(e) => { setReportDate(e.target.value); clearFieldError("reportDate"); }}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 ${errors.reportDate ? "border-red-400 focus:ring-red-300" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"}`}
              />
              {errors.reportDate && <p className="text-red-500 text-[10px] mt-0.5">{errors.reportDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Project</label>
              <input
                value={tenderId || "No project selected"} readOnly
                className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed ${!tenderId ? "border-red-300 bg-red-50 text-red-400" : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
              />
              {!tenderId && <p className="text-red-500 text-[10px] mt-0.5">Open a project to continue</p>}
            </div>
          </div>

          {/* Contractor Sections */}
          <div className="px-6 py-5 space-y-6">
            {sections.map((section, sIdx) => (
              <ContractorSection
                key={section.sectionId}
                section={section}
                sectionIndex={sIdx}
                contractors={contractors}
                boqItems={boqItems}
                boqLoading={boqLoading}
                usedContractorIds={usedContractorIds.filter((id) => id !== section.contractorId)}
                tenderId={tenderId}
                canRemove={sections.length > 1}
                sectionErrors={errors.sections[section.sectionId] || {}}
                onChangeContractor={(id) => updateContractor(section.sectionId, id)}
                onRemarkChange={(v) => updateRemark(section.sectionId, v)}
                onAttendanceLoaded={(att) => updateAttendance(section.sectionId, att)}
                onAttendanceChange={(idx, field, val) => updateAttendanceRow(section.sectionId, idx, field, val)}
                onAddWorkEntry={() => addWorkEntry(section.sectionId)}
                onWorkEntryChange={(idx, field, val) => updateWorkEntry(section.sectionId, idx, field, val)}
                onRemoveWorkEntry={(idx) => removeWorkEntry(section.sectionId, idx)}
                onRemoveSection={() => removeSection(section.sectionId)}
              />
            ))}

            <button
              onClick={addSection}
              className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors"
            >
              <FiPlus size={16} /> Add Contractor
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <div className="flex gap-6 text-sm">
            <span className="text-gray-500">Contractors: <strong className="text-gray-800 dark:text-white">{sections.filter((s) => s.contractorId).length}</strong></span>
            <span className="text-gray-500">Man-Days: <strong className="text-gray-800 dark:text-white">{totals.manDays}</strong></span>
            <span className="text-gray-500">Total Wages: <strong className="text-green-600">₹{totals.amount.toLocaleString("en-IN")}</strong></span>
          </div>
          <div className="flex gap-3">
            <button onClick={onclose} disabled={loading}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FiSave />}
              {loading ? "Saving..." : "Submit Report"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Contractor Section ───────────────────────────────────────────────────────

const ContractorSection = ({
  section, sectionIndex, contractors, boqItems, boqLoading, usedContractorIds, tenderId,
  canRemove, sectionErrors,
  onChangeContractor, onRemarkChange, onAttendanceLoaded, onAttendanceChange,
  onAddWorkEntry, onWorkEntryChange, onRemoveWorkEntry, onRemoveSection,
}) => {
  const { data: contractorData, isLoading } = useContractorEmployees(section.contractorId, tenderId);
  const employees = useMemo(() => contractorData?.employees || [], [contractorData]);
  const wageFixing = useMemo(() => contractorData?.wage_fixing || [], [contractorData]);
  const wageMap = useMemo(() => {
    const m = {}; wageFixing.forEach((w) => { m[w.category] = w.wage; }); return m;
  }, [wageFixing]);

  useEffect(() => {
    if (employees.length > 0) onAttendanceLoaded(employees.map((e) => emptyAttendance(e, wageMap)));
    else onAttendanceLoaded([]);
  }, [employees, wageMap]); // eslint-disable-line react-hooks/exhaustive-deps

  // Category summary from attendance
  const categorySummary = useMemo(() => {
    const map = {};
    section.attendance.forEach((a) => {
      if (!map[a.category]) map[a.category] = { total: 0, present: 0, halfDay: 0, quarterDay: 0, absent: 0, amount: 0 };
      map[a.category].total++;
      const w = parseFloat(a.daily_wage) || 0;
      if (a.status === "PRESENT") { map[a.category].present++; map[a.category].amount += w; }
      else if (a.status === "HALF_DAY") { map[a.category].halfDay++; map[a.category].amount += w / 2; }
      else if (a.status === "QUARTER_DAY") { map[a.category].quarterDay++; map[a.category].amount += w * 0.25; }
      else { map[a.category].absent++; }
    });
    return Object.entries(map).map(([cat, v]) => ({
      category: cat,
      ...v,
      manDays: v.present + (v.halfDay * 0.5) + (v.quarterDay * 0.25),
    }));
  }, [section.attendance]);

  const contractorError = sectionErrors.contractorId || "";
  const workEntryErrors = sectionErrors.workEntries || {};

  return (
    <div className={`rounded-xl border ${contractorError ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-900`}>

      {/* Section Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <span className="text-xs font-bold text-gray-400 shrink-0">#{sectionIndex + 1}</span>
        <div className="flex-1">
          <SearchableSelect
            value={section.contractorId}
            onChange={onChangeContractor}
            hasError={!!contractorError}
            placeholder="Search contractor..."
            options={contractors
              .filter((c) => !usedContractorIds.includes(c.value))
              .map((c) => ({ value: c.value, label: c.label }))}
          />
          {contractorError && <p className="text-red-500 text-[10px] mt-0.5">{contractorError}</p>}
        </div>

        {/* Wage chips */}
        {wageFixing.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {wageFixing.map((w, i) => (
              <span key={i} className="inline-flex gap-1 px-2 py-0.5 text-[10px] rounded-md border bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                {w.category}: <span className="font-semibold text-gray-700 dark:text-gray-300">₹{w.wage}</span>
              </span>
            ))}
          </div>
        )}

        {canRemove && (
          <button onClick={onRemoveSection} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0">
            <FiTrash2 size={14} />
          </button>
        )}
      </div>

      {/* Remark */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <input
          type="text" value={section.remark}
          onChange={(e) => onRemarkChange(e.target.value)}
          placeholder="Remark for this contractor..."
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Body */}
      {!section.contractorId ? (
        <div className="py-10 text-center text-sm text-gray-400">Select a contractor to begin</div>
      ) : isLoading ? (
        <div className="py-10 flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />Loading workers...
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">

          {/* ── ATTENDANCE ── */}
          <div className="px-4 py-3">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Attendance — {section.attendance.length} workers
            </p>

            {section.attendance.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No workers registered under this contractor</p>
            ) : (
              <>
                {/* Attendance table */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  {/* Head */}
                  <div className="grid grid-cols-[2fr_1.2fr_0.8fr_0.9fr_0.9fr_7rem_1.5fr] gap-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    {["Worker", "Category", "Wage ₹", "In Time", "Out Time", "Status", "Remark"].map((h) => (
                      <div key={h} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</div>
                    ))}
                  </div>
                  {/* Rows */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
                    {section.attendance.map((att, idx) => (
                      <AttendanceRow
                        key={att.worker_id} att={att} idx={idx}
                        onChange={onAttendanceChange}
                      />
                    ))}
                  </div>
                </div>

                {/* Category Summary */}
                {categorySummary.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categorySummary.map((c) => (
                      <div key={c.category} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{c.category}</span>
                        <span className="text-gray-400">·</span>
                        {c.present > 0 && <span className="text-green-600 font-medium">{c.present}P</span>}
                        {c.halfDay > 0 && <span className="text-yellow-600 font-medium">{c.halfDay}H</span>}
                        {c.quarterDay > 0 && <span className="text-orange-500 font-medium">{c.quarterDay}Q</span>}
                        {c.absent > 0 && <span className="text-red-500 font-medium">{c.absent}A</span>}
                        <span className="text-gray-400">·</span>
                        <span className="font-bold text-gray-700 dark:text-gray-200">{c.manDays}</span>
                        <span className="text-gray-400">·</span>
                        <span className="font-semibold text-green-600">₹{c.amount.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── WORK ENTRIES ── */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Work Entries — {section.workEntries.length} item{section.workEntries.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={onAddWorkEntry}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <FiPlus size={13} /> Add Entry
              </button>
            </div>

            {section.workEntries.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No work entries yet — click "Add Entry" to record work done today
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-visible">
                {/* Head */}
                <div className="grid grid-cols-[2.5fr_1.2fr_0.8fr_0.6fr_0.6fr_0.6fr_0.8fr_1.2fr_auto] gap-0 bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                  {["Description *", "Category", "Unit", "L", "B", "H", "Qty", "Remark", ""].map((h, i) => (
                    <div key={i} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-1">{h}</div>
                  ))}
                </div>
                {/* Rows */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
                  {section.workEntries.map((entry, idx) => (
                    <WorkEntryRow
                      key={entry.id} entry={entry} idx={idx}
                      boqItems={boqItems}
                      boqLoading={boqLoading}
                      categories={[...new Set(section.attendance.map((a) => a.category).filter(Boolean))]}
                      rowError={workEntryErrors[idx] || {}}
                      onChange={onWorkEntryChange}
                      onRemove={() => onRemoveWorkEntry(idx)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

// ─── Attendance Row ───────────────────────────────────────────────────────────

const STATUS_BTN = {
  PRESENT:  { active: "bg-green-500 text-white border-green-500",  label: "P" },
  HALF_DAY: { active: "bg-yellow-400 text-white border-yellow-400", label: "H" },
  QUARTER_DAY: { active: "bg-orange-400 text-white border-orange-400", label: "Q" },
  ABSENT:   { active: "bg-red-500 text-white border-red-500",      label: "A" },
};

const AttendanceRow = ({ att, idx, onChange }) => {
  const isAbsent = att.status === "ABSENT";
  const timeCls = `w-full border rounded-md px-2 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-700`;

  return (
    <div className={`grid grid-cols-[2fr_1.2fr_0.8fr_0.9fr_0.9fr_auto_1.5fr] items-center gap-0 px-4 py-2 transition-colors ${isAbsent ? "bg-red-50/40 dark:bg-red-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"}`}>

      {/* Worker */}
      <div>
        <p className={`text-sm font-medium truncate ${isAbsent ? "text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>{att.worker_name}</p>
        <p className="text-[10px] text-gray-400">{att.worker_id}</p>
      </div>

      {/* Category */}
      <div>
        <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-md border ${isAbsent ? "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700" : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"}`}>
          {att.category || "—"}
        </span>
      </div>

      {/* Wage */}
      <div>
        <span className={`text-sm font-semibold ${isAbsent ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
          ₹{att.daily_wage}
        </span>
      </div>

      {/* In Time */}
      <div className="pr-2">
        <input
          type="time" value={att.in_time} disabled={isAbsent}
          onChange={(e) => onChange(idx, "in_time", e.target.value)}
          className={`${timeCls} border-gray-200 dark:border-gray-600 text-center`}
        />
      </div>

      {/* Out Time */}
      <div className="pr-2">
        <input
          type="time" value={att.out_time} disabled={isAbsent}
          onChange={(e) => onChange(idx, "out_time", e.target.value)}
          className={`${timeCls} border-gray-200 dark:border-gray-600 text-center`}
        />
      </div>

      {/* Status toggle */}
      <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden mx-2">
        {["PRESENT", "HALF_DAY", "QUARTER_DAY", "ABSENT"].map((s) => (
          <button
            key={s} type="button"
            onClick={() => onChange(idx, "status", s)}
            className={`px-2.5 py-1.5 text-[11px] font-bold border-r last:border-r-0 border-gray-300 dark:border-gray-600 transition-colors ${att.status === s ? STATUS_BTN[s].active : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
          >
            {STATUS_BTN[s].label}
          </button>
        ))}
      </div>

      {/* Remark */}
      <div>
        <input
          type="text" value={att.remark} disabled={isAbsent}
          onChange={(e) => onChange(idx, "remark", e.target.value)}
          placeholder={isAbsent ? "—" : "Note..."}
          className={`${timeCls} border-gray-200 dark:border-gray-600`}
        />
      </div>
    </div>
  );
};

// ─── Work Entry Row ───────────────────────────────────────────────────────────

const WorkEntryRow = ({ entry, idx, boqItems, boqLoading, categories, rowError, onChange, onRemove }) => {
  const descError = rowError.description || "";

  const inputCls = (err = false, extra = "") =>
    `w-full border rounded-md px-2 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 transition-colors ${err ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-400"} ${extra}`;

  return (
    <div className="grid grid-cols-[2.5fr_1.2fr_0.8fr_0.6fr_0.6fr_0.6fr_0.8fr_1.2fr_auto] items-start gap-0 px-3 py-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/20">

      {/* Description */}
      <div className="px-1">
        <DescriptionSelect
          boqItems={boqItems} boqLoading={boqLoading} value={entry.description} hasError={!!descError}
          onChange={(val) => onChange(idx, "description", val)}
          onSelect={(item) => {
            onChange(idx, "description", `${item.item_id} - ${item.item_name}`);
            if (item.unit) onChange(idx, "unit", item.unit.toUpperCase());
          }}
        />
        {descError && <p className="text-red-500 text-[9px] mt-0.5">{descError}</p>}
      </div>

      {/* Category (work type) */}
      <div className="px-1">
        <SearchableSelect
          value={entry.category}
          onChange={(val) => onChange(idx, "category", val)}
          placeholder="Select..."
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      </div>

      {/* Unit */}
      <div className="px-1">
        <SearchableSelect
          value={entry.unit}
          onChange={(val) => onChange(idx, "unit", val)}
          options={UNITS.map((u) => ({ value: u, label: u }))}
        />
      </div>

      {/* L */}
      <div className="px-1">
        <input type="number" value={entry.l} placeholder="—"
          onChange={(e) => onChange(idx, "l", e.target.value)} className={inputCls(false, "text-center")} />
      </div>

      {/* B */}
      <div className="px-1">
        <input type="number" value={entry.b} placeholder="—"
          onChange={(e) => onChange(idx, "b", e.target.value)} className={inputCls(false, "text-center")} />
      </div>

      {/* H */}
      <div className="px-1">
        <input type="number" value={entry.h} placeholder="—"
          onChange={(e) => onChange(idx, "h", e.target.value)} className={inputCls(false, "text-center")} />
      </div>

      {/* Qty */}
      <div className="px-1">
        <input type="number" value={entry.quantity} placeholder="—"
          onChange={(e) => onChange(idx, "quantity", e.target.value)}
          className={inputCls(false, "text-center bg-blue-50 dark:bg-blue-900/20 font-medium")} />
      </div>

      {/* Remark */}
      <div className="px-1">
        <input type="text" value={entry.remark} placeholder="Note..."
          onChange={(e) => onChange(idx, "remark", e.target.value)} className={inputCls()} />
      </div>

      {/* Remove */}
      <div className="px-1 pt-1 flex justify-center">
        <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
          <FiTrash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Description searchable select (BOQ items) ───────────────────────────────

const DescriptionSelect = ({ boqItems, boqLoading, value, onChange, onSelect, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const q = search.toLowerCase();
  const filtered = boqItems.filter((b) => {
    const name = (b.item_name || "").toLowerCase();
    const id = String(b.item_id || "").toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={isOpen ? search : value}
        placeholder={boqLoading ? "Loading BOQ items..." : "Search or type description..."}
        onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
        onFocus={() => { setSearch(""); setIsOpen(true); }}
        className={`w-full border rounded-md px-2 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 transition-colors ${hasError ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-400"}`}
      />
      {isOpen && (
        <div className="absolute z-[100] left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {boqLoading ? (
            <div className="px-3 py-3 text-xs text-gray-400 text-center flex items-center justify-center gap-2">
              <span className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full" />
              Loading BOQ items...
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((b) => (
              <div
                key={b.item_id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(b); setIsOpen(false); setSearch(""); }}
                className="px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-50 dark:border-gray-700 last:border-0"
              >
                <span className="font-semibold text-blue-600 dark:text-blue-400">{b.item_id}</span>
                <span className="text-gray-600 dark:text-gray-300"> — {b.item_name}</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-center">
              {boqItems.length === 0
                ? <span className="text-orange-500">No BOQ items found for this project</span>
                : <span className="text-gray-400">No matches — type freely to use as description</span>
              }
            </div>
          )}
          {/* Allow free-text entry */}
          {!boqLoading && search.trim() && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(search.trim()); setIsOpen(false); setSearch(""); }}
              className="px-3 py-2 text-xs cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-t border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 italic"
            >
              Use &quot;{search.trim()}&quot; as description
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddDailyLabourSite;