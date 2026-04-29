import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { API } from "../../../../constant";
import { TbFileExport } from "react-icons/tb";
import Button from "../../../../components/Button";
import UploadBill from "../modals/UploadBill";

const BillDetailedTable = ({ tenderId, billId, status }) => {
  const [loading, setLoading] = useState(true);
  const [detailedData, setDetailedData] = useState(null);
  const [uploadDetail, setUploadDetail] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/clientbilling/estimate/details?tender_id=${tenderId}&bill_id=${billId}`,
      );
      if (res.data.status) {
        setDetailedData(res.data.data);
      } else {
        setDetailedData(null);
      }
    } catch {
      // 404 / no data — show empty state
      setDetailedData(null);
    } finally {
      setLoading(false);
    }
  }, [tenderId, billId]);

  useEffect(() => {
    if (tenderId && billId) fetchData();
  }, [tenderId, billId, fetchData]);

  const handleClose = () => setUploadDetail(false);

  const formatQty = (val) => (val ? Number(val).toFixed(3) : "");

  const groupByDay = (items) => {
    if (!items) return {};
    return items.reduce((acc, item) => {
      const day = item.day || "General";
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});
  };

  const renderDetails = (details, level = 0) => {
    return details.map((row, idx) => (
      <React.Fragment key={row._id || idx}>
        <tr className="hover:bg-gray-50 border-b border-gray-200 text-sm">
          <td className="p-2 border-r border-gray-300 text-center">
            {level === 0 ? String.fromCharCode(65 + idx) : idx + 1}
          </td>
          <td className={`p-2 border-r border-gray-300 ${level === 0 ? "font-bold text-gray-800" : "pl-8 text-gray-600"}`}>
            {row.description}
          </td>
          <td className="p-2 border-r border-gray-300 text-center">{row.nos}</td>
          <td className="p-2 border-r border-gray-300 text-right">{formatQty(row.length)}</td>
          <td className="p-2 border-r border-gray-300 text-right">{formatQty(row.breadth)}</td>
          <td className="p-2 border-r border-gray-300 text-right">{formatQty(row.depth)}</td>
          <td className={`p-2 border-r border-gray-300 text-right ${level === 0 ? "font-bold" : ""}`}>
            {formatQty(row.quantity)}
          </td>
          <td className="p-2 border-r border-gray-300 text-center">
            {level === 0 && <span className="text-xs font-bold">{row.unit || "M3"}</span>}
          </td>
          <td className="p-2 text-center text-xs text-gray-500"></td>
        </tr>
        {row.details && row.details.length > 0 && renderDetails(row.details, level + 1)}
      </React.Fragment>
    ));
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <>
      {/* Button — hidden when Approved */}
      {status !== "Approved" && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setUploadDetail(true)}
            button_name={detailedData ? "Update Details" : "Upload Details"}
            button_icon={<TbFileExport size={20} />}
          />
        </div>
      )}

      {/* Table or empty state */}
      {detailedData ? (
        <div className="border border-gray-400 shadow-sm bg-white overflow-hidden font-sans text-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead className="bg-green-100/50 text-gray-900 font-bold border-b-2 border-gray-400">
                <tr>
                  <th className="p-2 border-r border-gray-400 w-16 text-center">Code</th>
                  <th className="p-2 border-r border-gray-400 text-left min-w-[300px]">Description</th>
                  <th className="p-2 border-r border-gray-400 w-16 text-center">Nos</th>
                  <th className="p-2 border-r border-gray-400 w-20 text-right">Length</th>
                  <th className="p-2 border-r border-gray-400 w-20 text-right">Breadth</th>
                  <th className="p-2 border-r border-gray-400 w-20 text-right">Depth</th>
                  <th className="p-2 border-r border-gray-400 w-24 text-right bg-green-200/50">Quantity</th>
                  <th className="p-2 border-r border-gray-400 w-16 text-center">Unit</th>
                  <th className="p-2 w-24 text-center">Mbook</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupByDay(detailedData.items)).map(([day, items]) => (
                  <React.Fragment key={day}>
                    <tr className="bg-blue-100/80 border-b border-gray-300">
                      <td colSpan="9" className="p-2 font-bold text-blue-800 uppercase tracking-wide">
                        {day}
                      </td>
                    </tr>
                    {items.map((item) => (
                      <React.Fragment key={item._id}>
                        <tr className="border-b border-gray-300 bg-white">
                          <td className="p-2 border-r border-gray-300 text-center font-bold text-red-600 bg-red-50/20">{item.item_code}</td>
                          <td className="p-2 border-r border-gray-300 font-bold text-red-600 bg-red-50/20">{item.item_name}</td>
                          <td className="border-r border-gray-300"></td>
                          <td className="border-r border-gray-300"></td>
                          <td className="border-r border-gray-300"></td>
                          <td className="border-r border-gray-300"></td>
                          <td className="p-2 border-r border-gray-300 text-right font-bold text-red-600 bg-red-50/20">{formatQty(item.quantity)}</td>
                          <td className="p-2 border-r border-gray-300 text-center font-bold text-red-600 bg-red-50/20">{item.unit}</td>
                          <td className="p-2 text-center text-red-600 font-medium bg-red-50/20">{item.mb_book_ref}</td>
                        </tr>
                        {item.details && renderDetails(item.details)}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center p-12 border border-dashed border-gray-400 rounded-lg bg-gray-50 text-gray-500">
          <TbFileExport size={48} className="text-gray-300 mb-2" />
          <p className="font-medium">No bill estimate data found</p>
          <p className="text-xs text-gray-400 mt-1">Upload an Excel file to get started</p>
        </div>
      )}

      {/* Modal */}
      {uploadDetail && (
        <UploadBill
          onSuccess={fetchData}
          onclose={handleClose}
          bill_id={billId}
        />
      )}
    </>
  );
};

export default BillDetailedTable;
