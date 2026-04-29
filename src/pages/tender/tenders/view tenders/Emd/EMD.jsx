import React, { useEffect, useState } from "react";
import DeleteModal from "../../../../../components/DeleteModal";
import EditEMD from "./EditEMD";
import { useParams } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
import axios from "axios";
import { API } from "../../../../../constant";
import AddEMD from "./AddEMD";
import {
  IoAdd,
  IoSearch,
  IoTrashOutline,
  IoCreateOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoBusinessOutline,
  IoWalletOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";

const EMD = () => {
  const { tender_id } = useParams();

  const [emdData, setEmdData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchEMDSummary = async () => {
    try {
      const res = await axios.get(`${API}/tender/gettenderemd/${tender_id}`);
      if (res.data.status && res.data.data) {
        setEmdData(res.data.data);
      }
    } catch {
      console.error("Failed to load EMD summary");
    }
  };

  const fetchProposals = async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/emd/proposals/${tender_id}`, {
        params: {
          search: searchTerm,
          limit: 100, // Show all for the card view
        },
      });
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch proposals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEMDSummary();
    fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tender_id, searchTerm]);

  const handleReject = async (proposal_id) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return; // Cancelled

    try {
      await axios.put(`${API}/emd/rejectproposal/${tender_id}/${proposal_id}`, {
        rejection_reason: reason,
      });
      toast.success("Proposal rejected");
      fetchProposals();
      fetchEMDSummary();
    } catch (error) {
      console.error("Failed to reject proposal", error);
      toast.error("Failed to reject proposal");
    }
  };

  const handleDelete = async (proposal_id) => {
    try {
      await axios.delete(
        `${API}/emd/removeproposal/${tender_id}/${proposal_id}`,
      );
      toast.success("Proposal removed");
      setDeleteId(null);
      fetchProposals();
      fetchEMDSummary();
    } catch (error) {
      console.error("Failed to remove proposal", error);
      toast.error("Failed to remove proposal");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  };

  const fmt = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(val ?? 0);

  // Checks if any proposal in the list is already approved
  const hasApprovedProposal = items.some((item) => item.status === "APPROVED");

  return (
    <div className="pb-10 font-layout-font animate-fadeIn">
      {/* Header Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <IoWalletOutline size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total EMD Required
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {fmt(emdData?.emd?.emd_amount)}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <IoCheckmarkCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Approved Bidder
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[150px]">
              {emdData?.emd?.approved_emd_details?.emd_proposed_company ||
                "None Approved"}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <IoTimeOutline size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Expiry Date
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-white">
              {emdData?.emd?.emd_validity
                ? new Date(emdData.emd.emd_validity).toLocaleDateString("en-GB")
                : "Not Set"}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            placeholder="Search proposals, companies..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ✅ Button is now hidden if status is APPROVED */}
        {!hasApprovedProposal && (
          <button
            onClick={() => setShowAddModal(true)} 
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-darkest-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition-all shadow-md active:scale-95 animate-fadeIn"
          >
            <IoAdd size={20} /> Add EMD Proposal
          </button>
        )}
      </div>

      {/* Proposals Card Grid */}
      {loading ? (
        <div className="py-20 flex justify-center italic text-gray-400">
          Loading proposals...
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-300 dark:text-gray-600">
            <IoBusinessOutline size={48} />
          </div>
          <p className="text-gray-400">No proposals found for this tender.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.proposal_id}
              className={`group relative bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
                item.status === "APPROVED"
                  ? "border-green-500 ring-1 ring-green-500 shadow-xl"
                  : "border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Ranking Badge */}
              <div
                className={`absolute top-0 left-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-br-xl ${
                  item.level === "L1"
                    ? "bg-amber-400 text-amber-900"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                }`}
              >
                {item.level || "Pending Rank"}
              </div>

              {/* Card Body */}
              <div className="p-6 pt-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.company_name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {item.proposal_id}
                    </p>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(item.status)}`}
                  >
                    {item.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                      Bid Value
                    </label>
                    <p className="font-bold text-gray-700 dark:text-gray-200">
                      {fmt(item.proposed_amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                      EMD Details
                    </label>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">
                      {fmt(item.emd_amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                      Bank
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {item.payment_bank || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                      Date
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.payment_date
                        ? new Date(item.payment_date).toLocaleDateString(
                            "en-GB",
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                  {item.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => {
                          const mockItem = { ...item, status: "APPROVED" };
                          setEditItem(mockItem);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        <IoCheckmarkCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.proposal_id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        <IoCloseCircle size={16} /> Reject
                      </button>
                    </>
                  ) : item.status === "APPROVED" ? (
                    <div className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-500/10 text-green-600 rounded-lg text-xs font-bold">
                      <IoCheckmarkCircle size={18} /> Chosen Provider
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-lg text-xs font-bold italic">
                      <IoAlertCircleOutline size={18} /> Rejected{" "}
                      {item.rejection_reason
                        ? `(${item.rejection_reason})`
                        : ""}
                    </div>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {item.status !== "APPROVED" && (
                      <button
                        onClick={() => setDeleteId(item.proposal_id)}
                        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                        title="Delete Proposal"
                      >
                        <IoTrashOutline size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEMD
          onclose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchProposals();
            fetchEMDSummary();
          }}
        />
      )}
      {editItem && (
        <EditEMD
          onclose={() => setEditItem(null)}
          item={editItem}
          onUpdated={() => {
            fetchProposals();
            fetchEMDSummary();
          }}
        />
      )}
      {deleteId && (
        <DeleteModal
          deletetitle="EMD Proposal"
          onClose={() => setDeleteId(null)}
          onDelete={() => handleDelete(deleteId)}
        />
      )}
    </div>
  );
};

export default EMD;
