import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { useProject } from "../../../../context/ProjectContext";
import { API } from "../../../../constant";
import { format } from "date-fns";

const UploadScheduleModal = ({ onClose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const { tenderId } = useProject();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. Fetch Data for CSV ---
  const fetchWBS = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      // Fetching the structure to generate the CSV template
      const res = await axios.get(`${API}/schedule/get-daily-schedule/${tenderId}`);
      if (res.data && res.data.data) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch WBS items", err);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWBS();
  }, [tenderId]);

  // --- 2. Dynamic CSV Generator ---
  const downloadSampleCsv = () => {
    if (items.length === 0) {
      toast.warning("No items found to generate CSV.");
      return;
    }

    // Define Headers
    const headers = [
      "wbs_id",
      "description",
      "unit",
      "quantity",
      "start_date",
      "end_date",
      "revised_end_date"
    ];

    // Map API data to CSV rows
    const csvRows = items.map((item) => {
      // Helper to format date safely (leave empty if null)
      const formatDate = (d) => (d ? format(new Date(d), "dd/MM/yyyy") : "");

      // Escape description quotes to avoid breaking CSV format
      const safeDescription = item.description ? `"${item.description.replace(/"/g, '""')}"` : "";

      return [
        item.wbs_id,
        safeDescription,
        item.unit,
        item.quantity,
        formatDate(item.start_date),
        formatDate(item.end_date),
        formatDate(item.revised_end_date),
      ].join(",");
    });

    // Combine Headers and Rows
    const csvString = [headers.join(","), ...csvRows].join("\n");

    // Create Download Link
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `schedule_template_${tenderId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...fileArray]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files.length) {
      handleFiles(e.target.files);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("tender_id", tenderId);

      // Pass file
      if (files.length === 1) {
        formData.append("file", files[0]);
        await axios.post(`${API}/schedulelite/upload-csv-dates`, formData, {
          withCredentials: true,
        });
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
      toast.success("Schedule updated successfully");
      setSaving(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      setSaving(false);
    }
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-50">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full md:w-[600px] p-6 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <IoClose size={24} className="text-gray-700" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 select-none">
          Upload Schedule Dates
        </h2>

        <form
          onSubmit={onSubmit}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col"
        >
          {/* Drag & Drop Area */}
          <div
            onClick={() => inputRef.current.click()}
            className="border-4 border-dashed border-gray-300 rounded-lg py-12 px-6 mb-4 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === " " || e.key === "Enter"
                ? inputRef.current.click()
                : null
            }
            role="button"
            aria-label="File upload drop zone"
          >
            <p className="text-gray-500 text-lg mb-2 select-none">
              Drag & drop CSV file here or{" "}
              <span className="text-blue-600 font-medium underline">
                click to select
              </span>
            </p>
            <input
              type="file"
              accept=".xlsx, .xls,.csv"
              ref={inputRef}
              onChange={handleInputChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="overflow-y-auto max-h-48 border border-gray-200 rounded-md p-3 bg-gray-50 mb-4">
              <p className="text-gray-700 font-semibold text-sm mb-0.5 select-none">
                Selected file:
              </p>
              <ul className="space-y-1 text-gray-600 text-xs">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="truncate flex justify-between items-center"
                    title={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                  >
                    <span>{file.name}</span>
                    <span className="text-gray-400 text-xs">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-2">
            {/* <button
              type="button"
              onClick={downloadSampleCsv}
              disabled={loading || items.length === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Loading Template..." : "Download Template CSV"}
            </button> */}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={files.length === 0 || saving}
                className="py-2 cursor-pointer px-6 bg-darkest-blue hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadScheduleModal;