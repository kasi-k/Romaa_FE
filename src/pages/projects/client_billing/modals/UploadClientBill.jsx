import axios from "axios";
import { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { API } from "../../../../constant";
import { toast } from "react-toastify";
import { useProject } from "../../../../context/ProjectContext";
import SampleClientBillExcel from "../docs/CLIENTBILL.xlsx";

const emptyDeduction = () => ({ description: "", amount: "" });

const DEDUCTION_PRESETS = [
  "TDS @ 2%",
  "Labour Cess @ 1%",
  "Mobilization Advance Recovery",
];

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400";

const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

const UploadClientBill = ({ onclose, onSuccess }) => {
  const { tenderId } = useProject();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [billDate, setBillDate] = useState(today);
  const [taxMode, setTaxMode] = useState("instate");
  const [cgstPct, setCgstPct] = useState(9);
  const [sgstPct, setSgstPct] = useState(9);
  const [igstPct, setIgstPct] = useState(18);
  const [retentionPct, setRetentionPct] = useState(5);
  const [deductions, setDeductions] = useState([emptyDeduction()]);
  const [narration, setNarration] = useState("");

  /* ── File handling ──────────────────────────────────────────────────── */
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
    e.dataTransfer.clearData();
  };

  const handleInputChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  /* ── Deduction rows ─────────────────────────────────────────────────── */
  const addDeduction = () => setDeductions((prev) => [...prev, emptyDeduction()]);

  const removeDeduction = (idx) =>
    setDeductions((prev) => prev.filter((_, i) => i !== idx));

  const updateDeduction = (idx, field, value) =>
    setDeductions((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a CSV or XLSX file to upload.");
      return;
    }
    if (!tenderId) {
      toast.error("No active tender selected.");
      return;
    }

    const validDeductions = deductions.filter(
      (d) => d.description.trim() && d.amount !== ""
    );

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tender_id", tenderId);
      if (billDate) formData.append("bill_date", billDate);
      formData.append("tax_mode", taxMode);
      if (taxMode === "instate") {
        formData.append("cgst_pct", cgstPct);
        formData.append("sgst_pct", sgstPct);
        formData.append("igst_pct", 0);
      } else {
        formData.append("igst_pct", igstPct);
        formData.append("cgst_pct", 0);
        formData.append("sgst_pct", 0);
      }
      formData.append("retention_pct", retentionPct);
      if (narration.trim()) formData.append("narration", narration.trim());
      if (validDeductions.length > 0)
        formData.append("deductions", JSON.stringify(validDeductions));
      formData.append("created_by_user", "user_id_here");

      await axios.post(`${API}/clientbilling/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Client bill uploaded successfully");
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    } catch (error) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const downloadSampleFile = () => {
    const link = document.createElement("a");
    link.href = SampleClientBillExcel;
    link.setAttribute("download", "CLIENT BILL.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-start overflow-y-auto backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20 py-8">
      <div className="relative bg-white rounded-lg shadow-2xl w-full md:w-[640px] p-6 animate-fadeIn">
        {/* Close */}
        <button
          onClick={onclose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <IoClose size={24} className="text-gray-700" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 select-none">
          Upload Client Bill (CSV / XLSX)
        </h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* ── Drop zone ──────────────────────────────────────────── */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current.click()}
            tabIndex={0}
            role="button"
            aria-label="File upload drop zone"
            onKeyDown={(e) =>
              (e.key === " " || e.key === "Enter") && inputRef.current.click()
            }
            className="border-4 border-dashed border-gray-300 rounded-lg py-10 px-6 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {file ? (
              <p className="text-sm text-gray-700 font-medium">
                {file.name}{" "}
                <span className="text-gray-400">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </p>
            ) : (
              <p className="text-gray-500 text-base select-none">
                Drag & drop a CSV / XLSX here or{" "}
                <span className="text-blue-600 font-medium underline">
                  click to select
                </span>
              </p>
            )}
            <input
              type="file"
              accept=".csv,.xlsx"
              ref={inputRef}
              onChange={handleInputChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* ── Bill Date ──────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Bill Date</label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* ── Tax Mode ───────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Tax Mode</label>
            <div className="flex gap-3">
              {["instate", "otherstate"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTaxMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    taxMode === mode
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {mode === "instate" ? "Instate (CGST + SGST)" : "Other State (IGST)"}
                </button>
              ))}
            </div>
          </div>

          {/* ── GST fields ─────────────────────────────────────────── */}
          {taxMode === "instate" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>CGST %</label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  value={cgstPct}
                  onChange={(e) => setCgstPct(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>SGST %</label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  value={sgstPct}
                  onChange={(e) => setSgstPct(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className={labelCls}>IGST %</label>
              <input
                type="number"
                min={0}
                max={28}
                value={igstPct}
                onChange={(e) => setIgstPct(e.target.value)}
                className={inputCls}
              />
            </div>
          )}

          {/* ── Retention ──────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Retention %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={retentionPct}
              onChange={(e) => setRetentionPct(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* ── Deductions ─────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + " mb-0"}>Deductions</label>
              <button
                type="button"
                onClick={addDeduction}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                + Add Row
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {deductions.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) =>
                        updateDeduction(idx, "description", e.target.value)
                      }
                      list={`presets-${idx}`}
                      className={inputCls}
                    />
                    <datalist id={`presets-${idx}`}>
                      {DEDUCTION_PRESETS.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      placeholder="Amount"
                      min={0}
                      value={row.amount}
                      onChange={(e) =>
                        updateDeduction(idx, "amount", e.target.value)
                      }
                      className={inputCls}
                    />
                  </div>
                  {deductions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeduction(idx)}
                      className="mt-2 text-red-400 hover:text-red-600"
                      aria-label="Remove deduction"
                    >
                      <IoClose size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Narration ──────────────────────────────────────────── */}
          <div>
            <label className={labelCls}>Narration</label>
            <textarea
              rows={2}
              placeholder="Optional note about this bill"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className={inputCls + " resize-none"}
            />
          </div>

          {/* ── Buttons ────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={downloadSampleFile}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Download Sample
            </button>
            <button
              type="button"
              onClick={onclose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !file}
              className="px-6 py-2 bg-darkest-blue text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadClientBill;
