import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../../constant";

// utility: rupees -> lakhs
const toLakhs = (rs) => (rs || 0) / 100000; // 1 lakh = 100000 rupees [web:22]

const SiteOverHead = () => {
  const { tender_id } = useParams();
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState(new Set());
  const [freezed, setFreezed] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/siteoverhead/get/${tender_id}`);
      setFreezed(res.data.data.freeze);
      const json = res.data.data.siteOverhead;
      setData(json);
      setOpenSections(new Set((json.sections || []).map((s) => s.sno)));
    } catch {
      toast.error("Failed to fetch tenders");
    }
  }, [tender_id]);

  // GET API on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSection = (sno) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(sno) ? next.delete(sno) : next.add(sno);
      return next;
    });
  };

  const updateItem = (sectionIndex, itemIndex, field, value) => {
    setData((prev) => {
      const copy = structuredClone(prev);
      const item = copy.sections[sectionIndex].items[itemIndex];

      const numFields = ["nos", "months", "avg_salary_rs"];
      const parsed = numFields.includes(field) ? Number(value || 0) : value;
      item[field] = parsed;

      const rate = item.avg_salary_rs || 0;
      item.amount_rs = (item.nos || 0) * (item.months || 0) * rate;

      const sec = copy.sections[sectionIndex];
      sec.subtotal_rs = sec.items.reduce(
        (sum, it) => sum + (it.amount_rs || 0),
        0,
      );
      sec.subtotal_lakhs = toLakhs(sec.subtotal_rs);
      sec.total_nos = sec.items.reduce((sum, it) => sum + (it.nos || 0), 0);
      sec.total_months = sec.items.reduce(
        (sum, it) => sum + (it.months || 0),
        0,
      );

      copy.grand_total_overheads_rs = copy.sections.reduce(
        (sum, s) => sum + (s.subtotal_rs || 0),
        0,
      );

      return copy;
    });
  };

  const renderField = (value, inputProps) => {
    if (!isEditing) {
      return <span>{Number.isFinite(value) ? value || 0 : value || "-"}</span>;
    }
    return (
      <input
        {...inputProps}
        className="w-16 md:w-20 border rounded px-3 py-1.5 bg-transparent text-xs "
        value={value ?? ""}
      />
    );
  };

  const handleSave = async () => {
    if (!data) return;
    try {
      setIsSaving(true);
      setIsEditing(false);
      const res = await axios.put(
        `${API}/siteoverhead/update/${tender_id}`,
        data,
      );
      if (res.status === 200) {
        toast.success("Site overheads updated successfully");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to save site overheads");
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) {
    return <div className="p-4 text-sm">Loading site overheads...</div>;
  }

  return (
    <div className="font-roboto-flex flex flex-col gap-4 h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Site Overheads</h2>

        {/* VIEW MODE: only Edit button */}
        {!isEditing && !freezed && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-1.5 text-sm rounded dark:bg-layout-dark bg-white dark:text-white text-darkest-blue"
          >
            Edit
          </button>
        )}

        {/* EDIT MODE: Save + Cancel, no Edit button */}
        {isEditing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await handleSave();
              }}
              disabled={isSaving}
              className="px-3 py-1 text-sm rounded bg-emerald-600 text-white disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
              }}
              className="px-3 py-1 text-sm rounded bg-gray-500 text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Header fields (read-only) */}
      <div className="grid grid-cols-4 gap-4 bg-white dark:bg-layout-dark p-4 rounded-md shadow">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tender ID</label>
          <div className="text-sm">{data.tenderId || "-"}</div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">
            Tender Name
          </label>
          <div className="text-sm">{data.tenderName || "-"}</div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4 overflow-y-auto no-scrollbar">
        {data.sections.map((section, sIndex) => (
          <div
            key={section.sno}
            className="bg-white dark:bg-layout-dark rounded-md shadow border border-gray-200 dark:border-border-dark-grey"
          >
            <button
              type="button"
              onClick={() => toggleSection(section.sno)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold"
            >
              <span>
                {section.sno}. {section.title}
              </span>
              <span className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Subtotal: ₹{(section.subtotal_rs || 0).toLocaleString()} |{" "}
                  {toLakhs(section.subtotal_rs).toFixed(2)} L
                </span>
                {openSections.has(section.sno) ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </span>
            </button>

            {openSections.has(section.sno) && (
              <div className="px-4 pb-4">
                <table className="w-full text-xs border-t border-gray-200 dark:border-border-dark-grey">
                  <thead className="bg-gray-100 dark:bg-overall_bg-dark">
                    <tr>
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-right">Nos</th>
                      <th className="p-2 text-right">Months</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item, iIndex) => (
                      <tr
                        key={iIndex}
                        className="border-b border-gray-100 dark:border-border-dark-grey"
                      >
                        <td className="p-2 text-left">
                          <div className="font-medium">
                            {item.designation || item.description}
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          {renderField(item.nos, {
                            type: "number",
                            onChange: (e) =>
                              updateItem(sIndex, iIndex, "nos", e.target.value),
                          })}
                        </td>
                        <td className="p-2 text-right">
                          {renderField(item.months, {
                            type: "number",
                            onChange: (e) =>
                              updateItem(
                                sIndex,
                                iIndex,
                                "months",
                                e.target.value,
                              ),
                          })}
                        </td>
                        <td className="p-2 text-right">
                          {renderField(item.avg_salary_rs || 0, {
                            type: "number",
                            onChange: (e) =>
                              updateItem(
                                sIndex,
                                iIndex,
                                "avg_salary_rs",
                                e.target.value,
                              ),
                          })}
                        </td>

                        <td className="p-2 text-right">
                          ₹{(item.amount_rs || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-2 text-xs text-right text-gray-500">
                  Total Nos: {section.total_nos || 0} | Total Months:{" "}
                  {section.total_months || 0} | Subtotal:{" "}
                  {toLakhs(section.subtotal_rs).toFixed(2)} L
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grand total footer */}
      <div className="mt-2 self-end text-sm font-semibold bg-white dark:bg-layout-dark px-4 py-2 rounded-md shadow">
        Grand Total Overheads: ₹
        {(data.grand_total_overheads_rs || 0).toLocaleString()} (
        {toLakhs(data.grand_total_overheads_rs).toFixed(2)} L)
      </div>
    </div>
  );
};

export default SiteOverHead;
