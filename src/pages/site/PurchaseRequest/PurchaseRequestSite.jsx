import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FiEye } from "react-icons/fi";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import { TbFileExport, TbPlus } from "react-icons/tb";
import AddPurchaseRequestSite from "./AddPurchaseRequestSite";
import { API } from "../../../constant";
import { BiFilterAlt } from "react-icons/bi";

const PurchaseRequestSite = () => {
  const [data, setData] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const fetchPurchaseRequests = async () => {
    try {
      const res = await axios.get(
        `${API}/purchaseorderrequest/api/getbyId/${localStorage.getItem(
          "tenderId"
        )}`
      );

      const formatted = res.data?.data.map((item) => ({
        requestId: item.requestId,
        siteName: item.siteDetails?.siteName || "N/A",
        siteLocation: item.siteDetails?.location || "N/A",
        requiredOn: new Date(item.requiredByDate).toLocaleDateString("en-IN"),
        status: item.status,
        materials: item.materialsRequired?.map((m, i) => ({
          sno: i + 1,
          material: m.materialName,
          qty: m.quantity,
          unit: m.unit,
          remarks: m.remarks || "—",
        })),
      }));

      setData(formatted || []);
    } catch (error) {
      console.error("Error loading purchase requests", error);
    }
  };

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

   
    const styles = {
      "Request Raised": " text-gray-700 border-gray-200 dark:text-gray-300 dark:border-gray-700",
      "Quotation Requested": " text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800",
      "Quotation Received": " text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800",
      "Vendor Approved": " text-indigo-700 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800",
      "Purchase Order Issued": " text-purple-700 border-purple-200 dark:text-purple-400 dark:border-purple-800",
      "Completed": " text-green-700 border-green-200 dark:text-green-400 dark:border-green-800",
    };
  

  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <div className="flex justify-between">
        <Title
          title="Site Management"
          sub_title="Purchase Request"
          page_title="Purchase Request"
        />
        <div className="flex items-center gap-3">
          <Button
            button_name="Add Purchase Request"
            button_icon={<TbPlus size={22} />}
            onClick={() => setOpenAddModal(true)}
            onSuccess={fetchPurchaseRequests}
          />
          <Button
            button_icon={<TbFileExport size={22} />}
            button_name="Export"
            bgColor="bg-layout-dark"
          />
          <Button
            button_icon={<BiFilterAlt size={22} />}
            button_name="Filter"
            bgColor="bg-layout-dark"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-y-auto no-scrollbar">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="font-semibold text-sm dark:bg-layout-dark border-b-4 border-b dark:border-border-dark-grey bg-white border-light-blue">
              <th className="p-3 rounded-l-lg">S.No</th>

              {[
                "Request ID",
                "Site Name",
                "Location",
                "Required On",
                "Status",
              ].map((heading) => (
                <th key={heading} className="p-3">
                  <h1 className="flex items-center justify-center gap-2">
                    {heading} <HiArrowsUpDown size={18} />
                  </h1>
                </th>
              ))}

              <th className="p-3 rounded-r-lg">Action</th>
            </tr>
          </thead>

          <tbody className="text-greyish dark:text-gray-200">
            {data.map((item, index) => (
              <React.Fragment key={index}>
                {/* MAIN ROW */}
                <tr className="border-b-[3px] border-b-gray-200 text-center dark:bg-layout-dark bg-white">
                  <td className="py-3 font-medium">{index + 1}</td>
                  <td>{item.requestId}</td>
                  <td>{item.siteName}</td>
                  <td>{item.siteLocation}</td>
                  <td>{item.requiredOn}</td>
                  <td className={`font-medium text-primary ${styles[item.status]}`}>{item.status}</td>

                  <td className="pr-2 pt-1 flex justify-center">
                    <button
                      onClick={() => toggleRow(index)}
                      className="cursor-pointer bg-blue-200 text-blue-700 rounded p-1.5"
                    >
                      {expandedRow === index ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ROW */}
                {expandedRow === index && (
                  <tr>
                    <td
                      colSpan={7}
                      className="bg-white dark:bg-layout-dark p-4"
                    >
                      {/* MATERIAL TABLE */}
                      <table className="w-full border text-xs">
                        <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                          <tr>
                            <th className="border p-2">S.No</th>
                            <th className="border p-2 text-left">Material</th>
                            <th className="border p-2">Qty</th>
                            <th className="border p-2">Unit</th>
                          </tr>
                        </thead>

                        <tbody>
                          {item.materials?.map((m) => (
                            <tr key={m.sno}>
                              <td className="border p-2 text-center">
                                {m.sno}
                              </td>
                              <td className="border p-2">{m.material}</td>
                              <td className="border p-2 text-center">
                                {m.qty}
                              </td>
                              <td className="border p-2 text-center">
                                {m.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {openAddModal && (
        <AddPurchaseRequestSite onclose={() => setOpenAddModal(false)} onSuccess={fetchPurchaseRequests}/>
      )}
    </div>
  );
};

export default PurchaseRequestSite;
