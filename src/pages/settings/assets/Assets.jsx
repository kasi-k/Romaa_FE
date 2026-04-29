import React, { useState } from "react";
import axios from "axios";
import Machinery from "./machinery/MachineryForm";
import { API } from "../../../constant";
import MachineryTable from "./machinery/Machinery";
import Title from "../../../components/Title";

const Assets = () => {
  const [activeTab, setActiveTab] = useState("Machinery");
  const [openForm, setOpenForm] = useState(false);

  const tabs = ["Machinery",  "Equipment"];

  // Submit Machinery Form to API
  const handleMachinerySubmit = async (data) => {
    try {
      const response = await axios.post(
        `${API}/machineryasset/api/machinery-assets`,
        data
      );

      console.log("Saved:", response.data);
      alert("Machinery Asset Saved Successfully!");

      setOpenForm(false);
    } catch (error) {
      console.error("Error saving machinery:", error);
      alert("Failed to save machinery asset");
    }
  };

  return (
    <>
      <Title
        title="Settings"
        sub_title="Assets"
        active_title={activeTab}
        />
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition
              ${
                activeTab === tab
                  ? "bg-darkest-blue text-white shadow"
                  : "bg-white text-darkest-blue"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Add Button - only for Machinery */}
        {activeTab === "Machinery" && (
          <button
            onClick={() => setOpenForm(true)}
            className="flex items-center gap-2 bg-darkest-blue text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
          >
            <span className="text-lg leading-none">＋</span> Add Machinery
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-4 sm:mt-6">
        {activeTab === "Machinery" &&<MachineryTable />}
        {activeTab === "Trucks" && <p>Truck details…</p>}
        {activeTab === "Equipment" && <p>Equipment info…</p>}
      </div>

      {openForm && activeTab === "Machinery" && (
        <>
          {/* Form Component */}
          <Machinery onSubmit={handleMachinerySubmit} onclose={() =>setOpenForm(false)}/>
        </>
      )}
    </>
  );
};

export default Assets;
