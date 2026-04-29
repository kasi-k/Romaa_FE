import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { toast } from "react-toastify";
import GeneralAbstract from "./general abstract/GeneralAbstract";
import BOQProject from "./BOQTender/BOQProject";
import NewInletDet from "./new inlet det/NewInletDet";
import NewInletAbs from "./new inlet abs/NewInletAbs";
import { useProject } from "../../../../context/ProjectContext";
import { API } from "../../../../constant";

const ProjectDetailedEstimate = () => {
  const { tenderId: tender_id } = useProject();
  const [tabs, setTabs] = useState([
    { id: "1", label: "GS(General Abstract)", component: <GeneralAbstract /> },
    { id: "2", label: "Bill of Qty", component: <BOQProject /> },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch headings from backend
  const fetchHeadings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/drawingvboqde/extractheadings`, {
        params: { tender_id },
      });

      if (res.data.status && res.data.data.length > 0) {
        const dynamicTabs = res.data.data.flatMap((item, index) => [
          {
            id: `${item.heading}-abs-${index}`,
            label: `${item.heading} Abstract`,
            component: <NewInletAbs name={item.abstractKey} />,
          },
          {
            id: `${item.heading}-det-${index}`,
            label: `${item.heading} Detailed`,
            component: <NewInletDet name={item.detailedKey} />,
          },
        ]);

        setTabs((prev) => [prev[0], prev[1], ...dynamicTabs]);
      }
    } catch (error) {
      console.error("Error fetching headings:", error);
    }
  }, [tender_id]);

  // ✅ Add new heading
  const handleAddTabs = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a heading name");

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/drawingvboqde/addheading?tender_id=${tender_id}`,
        {
          heading: name.toLowerCase().trim(),
          abstract: [],
          detailed: [],
        }
      );

      if (res.data.status) {
        toast.success("Detailed Estimate added successfully");
        setName("");
        fetchHeadings(); // refresh tab list
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
    <div className="font-roboto-flex h-full flex flex-col">
      {/* Add Heading */}
      <form onSubmit={handleAddTabs} className="flex gap-2   justify-end">
        <input
          type="text"
          placeholder="Enter Name (e.g., Road, New Inlet)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3  text-sm w-60"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm text-white ${
            loading ? "bg-gray-400" : "bg-darkest-blue hover:bg-blue-800"
          }`}
        >
          {loading ? "Adding..." : "Add Tabs"}
        </button>
      </form>

      {/* Tabs */}
      <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label }) => (
          <p
            key={id}
            className={`first-letter:uppercase px-4 py-2.5 rounded-lg text-sm cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === id
                ? "bg-darkest-blue text-white"
                : "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue"
            }`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </p>
        ))}
      </div>

      {/* Active Component */}
      {/* Active Component */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {activeTabData?.component || (
          <div className="text-center text-gray-500 mt-4">
            Select a tab to view content
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailedEstimate;
