import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../../../../../components/Title";
import { MdArrowBackIosNew } from "react-icons/md";
import { SnowflakeIcon, AlertTriangle, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";
import ConfirmModal from "../../../../../components/ConfirmModal";
import GeneralAbstract from "./general abstract/GeneralAbstract";
import BOQProject from "./BOQTender/BOQProject";
import NewInletDet from "./new inlet det/NewInletDet";
import NewInletAbs from "./new inlet abs/NewInletAbs";

const TenderDetailedEstimate = () => {
  const { tender_id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => navigate(`/tender/tenders/viewtender/${tender_id}?tab=3`);

  const [tabs, setTabs] = useState([
    { id: "1", label: "GS(General Abstract)", component: <GeneralAbstract /> },
    { id: "2", label: "Bill of Qty", component: <BOQProject /> },
  ]);
  const [headingsList, setHeadingsList] = useState([]);
  const [activeTab, setActiveTab]       = useState("1");
  const [name, setName]                 = useState("");
  const [loading, setLoading]           = useState(false);
  const [isFrozen, setIsFrozen]         = useState(false);
  const [isFreezing, setIsFreezing]     = useState(false);
  const [isChecking, setIsChecking]     = useState(false);

  // Modal states
  const [showFreezeConfirm, setShowFreezeConfirm]   = useState(false);
  const [showPreFreezeModal, setShowPreFreezeModal] = useState(false);
  const [emptyTabs, setEmptyTabs]                   = useState([]);
  const [deletingHeading, setDeletingHeading]       = useState(null);

  // ── Fetch headings ────────────────────────────────────────────────────────
  const fetchHeadings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/detailedestimate/extractheadings`, {
        params: { tender_id },
      });

      if (res.data.status) {
        setIsFrozen(!!res.data.is_freeze);
        const headings = res.data.data || [];
        setHeadingsList(headings);

        if (headings.length > 0) {
          const frozen = !!res.data.is_freeze;
          const dynamicTabs = headings.flatMap((item, index) => [
            {
              id: `${item.heading}-abs-${index}`,
              label: `${item.heading} Abstract`,
              abstractKey: item.abstractKey,
              heading: item.heading,
              component: <NewInletAbs name={item.abstractKey} isFrozen={frozen} />,
            },
            {
              id: `${item.heading}-det-${index}`,
              label: `${item.heading} Detailed`,
              component: <NewInletDet name={item.detailedKey} />,
            },
          ]);
          setTabs((prev) => [prev[0], prev[1], ...dynamicTabs]);
        }
      }
    } catch (error) {
      console.error("Error fetching headings:", error);
    }
  }, [tender_id]);

  // ── Pre-freeze check: find tabs with no data ──────────────────────────────
  const handlePreFreezeCheck = async () => {
    if (headingsList.length === 0) {
      setShowFreezeConfirm(true);
      return;
    }

    setIsChecking(true);
    try {
      const checks = await Promise.all(
        headingsList.map(async (item) => {
          const res = await axios.get(`${API}/detailedestimate/getdatacustomhead`, {
            params: { tender_id, nametype: item.abstractKey },
          });
          const count = res.data?.data?.length ?? 0;
          return { heading: item.heading, abstractKey: item.abstractKey, count };
        })
      );

      const empty = checks.filter((c) => c.count === 0);
      if (empty.length > 0) {
        setEmptyTabs(empty);
        setShowPreFreezeModal(true);
      } else {
        setShowFreezeConfirm(true);
      }
    } catch (error) {
      console.error("Error checking tabs:", error);
      toast.error("Failed to validate tabs. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // ── Delete an empty heading ───────────────────────────────────────────────
  const handleDeleteHeading = async (heading) => {
    setDeletingHeading(heading);
    try {
      const res = await axios.delete(`${API}/detailedestimate/deleteheading`, {
        params: { tender_id, heading },
      });
      if (res.data.status) {
        toast.success(`"${heading}" tab deleted`);
        setEmptyTabs((prev) => prev.filter((t) => t.heading !== heading));
        await fetchHeadings();
      } else {
        toast.error(res.data.message || "Failed to delete tab");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete tab");
    } finally {
      setDeletingHeading(null);
    }
  };

  // ── Go to a specific tab & close modal ───────────────────────────────────
  const handleGoToTab = (heading, index) => {
    const tabId = `${heading}-abs-${index}`;
    setActiveTab(tabId);
    setShowPreFreezeModal(false);
  };

  // ── Freeze ────────────────────────────────────────────────────────────────
  const handleFreeze = async () => {
    setIsFreezing(true);
    try {
      const res = await axios.put(`${API}/detailedestimate/freeze?tender_id=${tender_id}`, { is_freeze: true });
      if (res.data.status) {
        setIsFrozen(true);
        setTabs((prev) =>
          prev.map((tab) =>
            tab.component?.props?.isFrozen !== undefined
              ? { ...tab, component: React.cloneElement(tab.component, { isFrozen: true }) }
              : tab
          )
        );
        toast.success("Detailed estimate frozen successfully");
      } else {
        toast.error(res.data.message || "Failed to freeze");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to freeze");
    } finally {
      setIsFreezing(false);
    }
  };

  // ── Add new heading ───────────────────────────────────────────────────────
  const handleAddTabs = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a heading name");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/detailedestimate/addheading?tender_id=${tender_id}`,
        { heading: name.toLowerCase().trim(), abstract: [], detailed: [] }
      );
      if (res.data.status) {
        toast.success("Detailed Estimate added successfully");
        setName("");
        fetchHeadings();
      } else {
        toast.error(res.data.message || "Failed to add Detailed Estimate");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding Detailed Estimate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tender_id) fetchHeadings();
  }, [tender_id, fetchHeadings]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-darkest-blue dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm"
              title="Go Back"
            >
              <MdArrowBackIosNew size={18} className="translate-x-0.5" />
            </button>
            <Title page_title=" Tender Detailed Estimate" />
          </div>

          {!isFrozen ? (
            <button
              onClick={handlePreFreezeCheck}
              disabled={isChecking || isFreezing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <SnowflakeIcon size={16} />
              {isChecking ? "Checking..." : "Freeze"}
            </button>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 border-2 border-blue-400 rounded-lg shadow-md shadow-blue-200 dark:shadow-blue-900/30 animate-pulse">
              <SnowflakeIcon size={16} />
              Frozen
            </span>
          )}
        </div>

        {/* Add Heading — hidden once frozen */}
        {!isFrozen && (
          <form onSubmit={handleAddTabs} className="flex gap-2 justify-end">
            <input
              type="text"
              placeholder="Enter Name (e.g., Road, New Inlet)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded px-3 text-sm w-60"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm text-white ${loading ? "bg-gray-400" : "bg-darkest-blue hover:bg-blue-800"}`}
            >
              {loading ? "Adding..." : "Add Tabs"}
            </button>
          </form>
        )}

        {/* Tabs */}
        <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
          {tabs.map(({ id, label }) => (
            <p
              key={id}
              onClick={() => setActiveTab(id)}
              className={`first-letter:uppercase px-4 py-2.5 rounded-lg text-sm cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                activeTab === id
                  ? "bg-darkest-blue text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-darkest-blue dark:text-slate-300 hover:opacity-80"
              }`}
            >
              {label}
            </p>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
        <div className="mt-4">
          {activeTabData?.component || (
            <div className="text-center text-gray-500 mt-4">Select a tab to view content</div>
          )}
        </div>
      </div>

      {/* ── Pre-freeze warning modal ─────────────────────────────────────── */}
      {showPreFreezeModal && (
        <div className="font-roboto-flex fixed inset-0 flex justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-60">
          <div className="bg-white dark:bg-layout-dark rounded-xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                  <AlertTriangle size={22} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg dark:text-white">Tabs with No Data</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {emptyTabs.length} tab{emptyTabs.length > 1 ? "s have" : " has"} no uploaded data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreFreezeModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <IoClose size={20} />
              </button>
            </div>

            {/* Tab list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Please upload data or delete these tabs before freezing. You can also continue freeze anyway.
              </p>

              {emptyTabs.map((tab, index) => (
                <div
                  key={tab.heading}
                  className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-bold rounded-full">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
                        {tab.heading} Abstract
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">No data uploaded</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Go to tab to upload */}
                    <button
                      onClick={() => handleGoToTab(tab.heading, headingsList.findIndex(h => h.heading === tab.heading))}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-700/40 rounded-lg transition-colors"
                    >
                      Upload <ArrowRight size={12} />
                    </button>

                    {/* Delete empty tab */}
                    <button
                      onClick={() => handleDeleteHeading(tab.heading)}
                      disabled={deletingHeading === tab.heading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-700/40 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingHeading === tab.heading ? (
                        "Deleting..."
                      ) : (
                        <><Trash2 size={12} /> Delete</>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {emptyTabs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <CheckCircle2 size={36} className="text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-600">All tabs have data!</p>
                  <p className="text-xs text-slate-400">You can now proceed to freeze.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setShowPreFreezeModal(false)}
                className="px-5 py-2 text-sm border border-slate-300 dark:border-slate-600 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowPreFreezeModal(false); setShowFreezeConfirm(true); }}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <SnowflakeIcon size={14} />
                Continue Freeze Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Freeze confirmation modal ────────────────────────────────────── */}
      {showFreezeConfirm && (
        <ConfirmModal
          title="Freeze Detailed Estimate?"
          message="Once frozen, all uploads will be disabled permanently. This action cannot be undone."
          confirmText="Freeze"
          onConfirm={handleFreeze}
          onClose={() => setShowFreezeConfirm(false)}
        />
      )}
    </div>
  );
};

export default TenderDetailedEstimate;
