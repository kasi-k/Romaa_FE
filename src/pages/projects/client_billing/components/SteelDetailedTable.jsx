import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { API } from "../../../../constant";
import { TbFileExport } from "react-icons/tb";
import Button from "../../../../components/Button";
import UploadDetail from "../modals/UploadDetail";

const SteelDetailedTable = ({ tenderId, billId, status }) => {
    const [loading, setLoading] = useState(true);
    const [detailedData, setDetailedData] = useState(null);
    const [uploadDetail, setUploadDetail] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API}/steelestimate/details?tender_id=${tenderId}&bill_id=${billId}`
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
        if (tenderId && billId) {
            fetchData();
        }
    }, [fetchData, tenderId, billId]);

    const handleClose = () => {
        setUploadDetail(false);
    };

    const formatVal = (val) => (val && Number(val) !== 0 ? Number(val).toFixed(2) : "");

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
                <tr className={`border-b border-gray-300 text-xs ${level === 0 ? "bg-gray-50/50" : "hover:bg-yellow-50"}`}>
                    <td className="p-1 border-r border-gray-300 text-center text-gray-400">
                        {level === 0 ? String.fromCharCode(65 + idx) : idx + 1}
                    </td>
                    <td className={`p-1 border-r border-gray-300 ${level === 0 ? "font-semibold text-gray-700 pl-2" : "pl-6 text-gray-600"}`}>
                        {row.description}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-center">{level > 0 && row.nos}</td>
                    <td className="p-1 border-r border-gray-300 text-right">{level > 0 && formatVal(row.cutting_length)}</td>
                    <td className="p-1 border-r border-gray-300 text-right">{level > 0 && formatVal(row.unit_weight)}</td>

                    <td className="p-1 border-r border-gray-300 text-right bg-gray-50/30">{formatVal(row.mm_8)}</td>
                    <td className="p-1 border-r border-gray-300 text-right">{formatVal(row.mm_10)}</td>
                    <td className="p-1 border-r border-gray-300 text-right bg-gray-50/30">{formatVal(row.mm_12)}</td>
                    <td className="p-1 border-r border-gray-300 text-right">{formatVal(row.mm_16)}</td>
                    <td className="p-1 border-r border-gray-300 text-right bg-gray-50/30">{formatVal(row.mm_20)}</td>
                    <td className="p-1 border-r border-gray-300 text-right">{formatVal(row.mm_25)}</td>
                    <td className="p-1 border-r border-gray-300 text-right bg-gray-50/30">{formatVal(row.mm_32)}</td>

                    <td className="p-1 border-r border-gray-300"></td>
                    <td className="p-1"></td>
                </tr>
                {row.details && row.details.length > 0 && renderDetails(row.details, level + 1)}
            </React.Fragment>
        ));
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <>
            {/* 1. BUTTON SECTION (Always Visible unless Approved) */}
            {status !== "Approved" && (
                <div className="flex justify-end mb-4">
                    <Button
                        onClick={() => setUploadDetail(true)}
                        button_name={detailedData ? "Update Steel Details" : "Upload Steel Details"}
                        button_icon={<TbFileExport size={20} />}
                    />
                </div>
            )}

            {/* 2. TABLE or NO DATA SECTION */}
            {detailedData ? (
                <div className="border border-gray-400 shadow-sm bg-white overflow-hidden font-sans text-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[1100px]">
                            <thead className="bg-slate-800 text-white font-semibold border-b-2 border-slate-600 text-xs uppercase tracking-wider">
                                <tr>
                                    <th rowSpan="2" className="p-2 border-r border-slate-600 w-12 text-center">Code</th>
                                    <th rowSpan="2" className="p-2 border-r border-slate-600 text-left min-w-[160px]">Description</th>
                                    <th rowSpan="2" className="p-2 border-r border-slate-600 w-12 text-center">Nos</th>
                                    <th rowSpan="2" className="p-2 border-r border-slate-600 w-16 text-right">Cut L.</th>
                                    <th rowSpan="2" className="p-2 border-r border-slate-600 w-16 text-right">Unit Wt</th>
                                    <th colSpan="7" className="p-2 border-r border-slate-600 text-center bg-slate-700">Diameter of Bars (mm)</th>
                                    <th rowSpan="2" className="p-2 border-r border-slate-600 w-20 text-right bg-slate-800">Total Wt</th>
                                    <th rowSpan="2" className="p-2 w-16 text-center bg-slate-800">Qtl</th>
                                </tr>
                                <tr>
                                    <th className="p-1 border-r border-slate-600 w-14 text-right bg-slate-700">8</th>
                                    <th className="p-1 border-r border-slate-600 w-14 text-right bg-slate-700">10</th>
                                    <th className="p-1 border-r border-slate-600 w-14 text-right bg-slate-700">12</th>
                                    <th className="p-1 border-r border-slate-600 w-14 text-right bg-slate-700">16</th>
                                    <th className="p-1 border-r border-slate-600 w-14 text-right bg-slate-700">20</th>
                                    <th className="p-1 border-r border-slate-600 w-14 text-right bg-slate-700">25</th>
                                    <th className="p-1 border-r border-slate-600 w-14 text-right bg-slate-700">32</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupByDay(detailedData.items)).map(([day, items]) => (
                                    <React.Fragment key={day}>
                                        <tr className="bg-yellow-100 border-b border-gray-300">
                                            <td colSpan="14" className="p-2 font-semibold text-slate-800 uppercase tracking-wide text-xs">📅 {day}</td>
                                        </tr>
                                        {items.map((item) => (
                                            <React.Fragment key={item._id}>
                                                <tr className="border-b border-gray-400 bg-blue-50/50">
                                                    <td className="p-2 border-r border-gray-300 text-center font-semibold text-blue-700 text-xs">{item.item_code}</td>
                                                    <td className="p-2 border-r border-gray-300 font-semibold text-blue-800 text-xs">{item.item_name}</td>
                                                    <td className="border-r border-gray-300"></td>
                                                    <td className="border-r border-gray-300"></td>
                                                    <td className="border-r border-gray-300"></td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700">{formatVal(item.mm_8)}</td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700">{formatVal(item.mm_10)}</td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700">{formatVal(item.mm_12)}</td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700">{formatVal(item.mm_16)}</td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700">{formatVal(item.mm_20)}</td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700">{formatVal(item.mm_25)}</td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700">{formatVal(item.mm_32)}</td>
                                                    <td className="p-2 border-r border-gray-300 text-right font-semibold text-xs text-red-700 bg-red-50">{formatVal(item.total_weight)}</td>
                                                    <td className="p-2 text-right font-semibold text-xs text-red-700 bg-yellow-200">{formatVal(item.qtl)}</td>
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
                // NO DATA VIEW
                <div className="flex flex-col justify-center items-center p-12 border border-dashed border-gray-400 rounded-lg bg-gray-50 text-gray-500">
                    <TbFileExport size={48} className="text-gray-300 mb-2" />
                    <p className="font-medium">No steel estimate data found</p>
                    <p className="text-xs text-gray-400 mt-1">Upload a CSV file to get started</p>
                </div>
            )}

            {/* 3. MODAL SECTION */}
            {uploadDetail && (
                <UploadDetail
                    onSuccess={fetchData}
                    onclose={handleClose}
                    bill_id={billId}
                />
            )}
        </>
    );
};

export default SteelDetailedTable;