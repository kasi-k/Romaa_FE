import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../../../../../../constant"; 
import { toast } from "react-toastify";

const BOQProject = () => {
  const { tender_id } = useParams();
  const [boqdata, setBoqdata] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to format currency/numbers safely
  const formatNumber = (num) => {
    if (num === undefined || num === null || num === "") return "-";
    return parseFloat(num).toFixed(2);
  };

  const getBoqProjectdata = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/detailedestimate/getbillofqty?tender_id=${tender_id}`
      );
      // setBoqdata sets the "data" object from your JSON
      setBoqdata(res.data.data);
    } catch (error) {
      console.error("Error fetching BOQ data:", error);
      toast.error("Failed to load BOQ data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tender_id) {
      getBoqProjectdata();
    }
  }, [tender_id]);

  // 1. FIXED: Extract Headings from "spent" (not total_spent)
  const headings = useMemo(() => {
    if (!boqdata?.spent) return [];
    return Object.keys(boqdata.spent);
  }, [boqdata]);

  // 2. FIXED: Calculate Grand Total using "billOfQty" (not billofqty)
  const grandTotalAmount = useMemo(() => {
    if (!boqdata?.billOfQty) return 0;
    return boqdata.billOfQty.reduce((acc, item) => {
      const amount = parseFloat(item.total_amount) || 0;
      return acc + amount;
    }, 0);
  }, [boqdata]);

  if (loading) {
    return <div className="p-4 text-center">Loading BOQ Data...</div>;
  }

  // FIXED: Check for "billOfQty"
  if (!boqdata || !Array.isArray(boqdata.billOfQty)) {
    return <div className="p-4 text-center text-red-500">No BOQ Data Found</div>;
  }

  return (

      <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            {/* Header Row 1 */}
            <tr className="bg-gray-100 text-gray-700 uppercase">
              <th rowSpan={2} className="border px-2 py-2 text-center w-12">
                Sl. No.
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-left min-w-[200px]">
                Description of Item
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-center w-16">
                Unit
              </th>
              <th rowSpan={2} className="border px-2 py-2 text-center w-16">
                Rate
              </th>
              {headings.map((h) => (
                <th
                  key={`head-${h}`}
                  colSpan={2}
                  className="border px-2 py-2 text-center bg-blue-50"
                >
                  {h.charAt(0).toUpperCase() + h.slice(1)}
                </th>
              ))}
              <th colSpan={2} className="border px-2 py-2 text-center bg-green-50">
                Total
              </th>
            </tr>

            {/* Header Row 2 */}
            <tr className="bg-gray-100 text-gray-600">
              {headings.map((h) => (
                <React.Fragment key={`sub-${h}`}>
                  <th className="border px-2 py-1 text-center w-20">Qty</th>
                  <th className="border px-2 py-1 text-center w-24">Amount</th>
                </React.Fragment>
              ))}
              <th className="border px-2 py-1 text-center w-20 bg-green-50">Qty</th>
              <th className="border px-2 py-1 text-center w-24 bg-green-50">Amount</th>
            </tr>
          </thead>

          <tbody>
            {/* FIXED: Map over "billOfQty" */}
            {boqdata.billOfQty.map((item, idx) => (
              <tr key={item.item_id || idx} className="hover:bg-gray-50 text-gray-600 transition-colors">
                <td className="border px-2 py-1 text-center">{idx + 1}</td>
                <td className="border px-2 py-1 font-medium">{item.item_name}</td>
                <td className="border px-2 py-1 text-center">{item.unit}</td>
                <td className="border px-2 py-1 text-center">{item.n_rate}</td>

                {/* Dynamic Columns */}
                {headings.map((h) => {
                  // Construct keys based on your JSON format (e.g. "inlet" + "quantity")
                  const qtyKey = `${h}quantity`; 
                  const amtKey = `${h}amount`;
                  
                  return (
                    <React.Fragment key={`row-${idx}-${h}`}>
                      <td className="border px-2 py-1 text-right text-gray-600">
                        {/* Check if undefined to handle missing keys safely */}
                        {item[qtyKey] !== undefined ? item[qtyKey] : "-"}
                      </td>
                      <td className="border px-2 py-1 text-right font-medium">
                        {item[amtKey] !== undefined ? formatNumber(item[amtKey]) : "-"}
                      </td>
                    </React.Fragment>
                  );
                })}

                {/* Row Total Columns */}
                <td className="border px-2 py-1 text-right bg-green-50/30">
                  {item.total_quantity}
                </td>
                <td className="border px-2 py-1 text-right font-bold bg-green-50/30">
                  {formatNumber(item.total_amount)}
                </td>
              </tr>
            ))}

            {/* Footer Row: Totals */}
            <tr className="bg-gray-200 font-bold border-t-2 border-gray-300 text-gray-600">
              <td colSpan={4} className="border px-2 py-2 text-center">
                Grand Total
              </td>
              {headings.map((h) => (
                <React.Fragment key={`total-${h}`}>
                  <td className="border px-2 py-2"></td>
                  <td className="border px-2 py-2 text-right">
                    {/* FIXED: Access "spent" directly */}
                    {formatNumber(boqdata.spent?.[h])}
                  </td>
                </React.Fragment>
              ))}
              <td className="border px-2 py-2 bg-green-100"></td>
              <td className="border px-2 py-2 text-right bg-green-100 text-blue-800">
                {formatNumber(grandTotalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
  );
};

export default BOQProject;