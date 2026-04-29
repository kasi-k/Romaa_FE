import React from "react";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const ViewStockRegisterSite = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // case 1: you navigate with { state: { item } } where `item` is ONE element from API `data`
  const materialItem = location.state?.item; // { item_description, received: [...] }



  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("en-GB").replaceAll("/", "-");
  };

  if (!materialItem) {
    return <p className="text-center mt-4 text-sm">No material data found</p>;
  }

  const { item_description, received = [] } = materialItem;

  return (
    <div>
      <div className="flex justify-between items-center my-2">
        <Title
          title="Site Management"
          sub_title="Material Received"
          active_title="View Material Received"
        />
      </div>

      <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-3 text-sm">
        <p className="font-semibold text-center text-lg">
          Material Received Details
        </p>

        {/* Header info for the material */}
        <div className="grid grid-cols-12 gap-2 items-start mb-3">
          <p className="col-span-4 font-medium">Material</p>
          <p className="col-span-8 text-xs opacity-70">
            {item_description || "-"}
          </p>
        </div>

        {/* Table of all received entries */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-input-bordergrey dark:border-border-dark-grey rounded">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-2 py-1 text-left">#</th>
                <th className="px-2 py-1 text-left">Request ID</th>
                <th className="px-2 py-1 text-left">Site</th>
                <th className="px-2 py-1 text-left">Received Qty</th>
                <th className="px-2 py-1 text-left">Received Date</th>
                <th className="px-2 py-1 text-left">Received By</th>
              </tr>
            </thead>
            <tbody>
              {received.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-2 text-center opacity-60">
                    No received entries found
                  </td>
                </tr>
              ) : (
                received.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t border-input-bordergrey dark:border-border-dark-grey"
                  >
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1">
                      {row.requestId || row.quotation_id || "-"}
                    </td>
                    <td className="px-2 py-1">
                      {row.site_name || "-"}
                    </td>
                    <td className="px-2 py-1">
                      {row.received_quantity ?? 0}
                    </td>
                    <td className="px-2 py-1">
                      {formatDate(row.received_date)}
                    </td>
                    <td className="px-2 py-1">
                      {row.received_by || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end py-2 ">
        <Button
          onClick={() => navigate("..")}
          button_name="Back"
          button_icon={<IoChevronBackSharp />}
        />
      </div>
    </div>
  );
};

export default ViewStockRegisterSite;
