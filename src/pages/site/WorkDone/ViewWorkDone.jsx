import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CalendarDays, Hash, ClipboardList } from "lucide-react";
import { useWorkDoneDetail } from "./hooks/useWorkDone";
import Loader from "../../../components/Loader";

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  Submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
};

const COLOR_MAP = {
  blue: { wrap: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-600" },
  orange: { wrap: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-500" },
  emerald: { wrap: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600" },
};

const InfoCard = ({ icon, color, label, value }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm">
      <div className={`p-2 rounded-lg ${c.wrap} ${c.icon}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">{label}</p>
        <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const ViewWorkDone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.item?._id;

  const { data: report, isLoading } = useWorkDoneDetail(id);

  if (isLoading) {
    return (
      <Loader/>
    );
  }

  if (!report) {
    return (
      <div className="p-10 text-center text-red-500 text-sm">
        Report not found.
      </div>
    );
  }

  const items = report.dailyWorkDone || [];
  const totalQty = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const statusClass = STATUS_COLORS[report.status] || STATUS_COLORS.Draft;

  return (
    <div className="font-roboto-flex dark:bg-[#0b0f19]">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Work Done Report
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {report.workId} · {report.tender_id}
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>
              {report.status}
            </span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard
              icon={<CalendarDays size={20} />}
              color="blue"
              label="Report Date"
              value={formatDate(report.report_date)}
            />
            <InfoCard
              icon={<ClipboardList size={20} />}
              color="orange"
              label="Created By"
              value={report.created_by || "—"}
            />
            <InfoCard
              icon={<Hash size={20} />}
              color="emerald"
              label="Total Qty"
              value={totalQty.toLocaleString("en-IN")}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 dark:text-white text-sm">
                Work Items
              </h2>
              <span className="text-xs text-gray-400">{items.length} entr{items.length !== 1 ? "ies" : "y"}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3 min-w-[200px]">Description</th>
                    <th className="px-3 py-3 text-center w-16">L</th>
                    <th className="px-3 py-3 text-center w-16">B</th>
                    <th className="px-3 py-3 text-center w-16">H</th>
                    <th className="px-4 py-3 text-right w-28">Quantity</th>
                    <th className="px-4 py-3 w-20">Unit</th>
                    <th className="px-4 py-3 min-w-[150px]">Contractor</th>
                    <th className="px-4 py-3 min-w-[160px]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-10 text-center text-gray-400 text-sm">
                        No items in this report.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr
                        key={item._id || i}
                        className="hover:bg-blue-50/20 dark:hover:bg-gray-700/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                          {item.item_description}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500">
                          {item.dimensions?.length || "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500">
                          {item.dimensions?.breadth || "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500">
                          {item.dimensions?.height || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-medium uppercase">
                          {item.unit}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {item.contractor_details || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs italic">
                          {item.remarks || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {items.length > 0 && (
                  <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700">
                    <tr>
                      <td colSpan="4" />
                      <td className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Total
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">
                        {totalQty.toLocaleString("en-IN")}
                      </td>
                      <td colSpan="3" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewWorkDone;
