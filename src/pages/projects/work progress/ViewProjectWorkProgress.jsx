import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CalendarDays, User, Hash, FileText, MapPin } from "lucide-react";
import { useWorkDoneDetail } from "../../site/WorkDone/hooks/useWorkDone";
import Loader from "../../../components/Loader";

const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Submitted: "bg-blue-100 text-blue-700 border-blue-200",
  Approved: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-600 border-red-200",
};

const ViewProjectWorkProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.item?._id;

  const { data, isLoading } = useWorkDoneDetail(id);

  const totalQty = useMemo(
    () => (data?.dailyWorkDone || []).reduce((acc, it) => acc + (it.quantity || 0), 0),
    [data]
  );

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-red-500 text-sm">Report not found.</div>
    );
  }

  const statusClass = STATUS_COLORS[data.status] || STATUS_COLORS.Draft;

  return (
    <div className="font-roboto-flex min-h-screen dark:bg-[#0b0f19] p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Daily Progress Report</h1>
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono font-semibold text-gray-600 dark:text-gray-300">
                  #{data.workId}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> {data.tender_id}
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusClass}`}>
            {data.status}
          </span>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <CalendarDays size={20} />, color: "blue", label: "Report Date", value: formatDate(data.report_date) },
            { icon: <User size={20} />, color: "purple", label: "Created By", value: data.created_by || "—" },
            { icon: <Hash size={20} />, color: "emerald", label: "Total Items", value: `${data.dailyWorkDone?.length || 0} Entries` },
          ].map(({ icon, color, label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm">
              <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600`}>{icon}</div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">{label}</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Work entries table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-2">
            <FileText size={15} className="text-blue-500" />
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">Work Done Entries</h3>
            <span className="ml-auto text-xs text-gray-400">{data.dailyWorkDone?.length || 0} items</span>
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
                  <th className="px-4 py-3 min-w-[140px]">Contractor</th>
                  <th className="px-4 py-3 min-w-[150px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.dailyWorkDone?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No entries in this report.
                    </td>
                  </tr>
                ) : (
                  data.dailyWorkDone?.map((item, i) => (
                    <tr key={item._id || i} className="hover:bg-blue-50/20 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.item_description}</td>
                      <td className="px-3 py-3 text-center text-gray-500">{item.dimensions?.length || "—"}</td>
                      <td className="px-3 py-3 text-center text-gray-500">{item.dimensions?.breadth || "—"}</td>
                      <td className="px-3 py-3 text-center text-gray-500">{item.dimensions?.height || "—"}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-medium uppercase">{item.unit}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.contractor_details || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs italic">{item.remarks || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {(data.dailyWorkDone?.length ?? 0) > 0 && (
                <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <td colSpan={5} />
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                      {totalQty.toLocaleString("en-IN")}
                    </td>
                    <td colSpan={3} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Total
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewProjectWorkProgress;
