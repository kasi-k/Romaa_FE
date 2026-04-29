import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, CheckCircle, ArrowLeft, Calendar, Users, IndianRupee, ClipboardList } from "lucide-react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import Loader from "../../../components/Loader";
import { useNMRAttendanceDetails, useApproveNMRAttendance } from "./hooks/useNMRAttendance";
import EditNMRAttendance from "./EditNMRAttendance";

const STATUS_STYLES = {
  PRESENT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ABSENT: "bg-red-100 text-red-700 border-red-200",
  HALF_DAY: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const RECORD_STATUS_STYLES = {
  SUBMITTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const InfoBlock = ({ label, value }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{value || "-"}</span>
  </div>
);

const ViewNMRAttendance = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const recordId = state?.id;

  const { data, isLoading } = useNMRAttendanceDetails(recordId);
  const record = data?.data || null;

  const approveMutation = useApproveNMRAttendance({
    onSuccess: () => setEditOpen(false),
  });

  if (!recordId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No attendance record selected.</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-blue-600 underline text-sm">
          Go Back
        </button>
      </div>
    );
  }

  if (isLoading) return <Loader />;

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>Record not found.</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-blue-600 underline text-sm">
          Go Back
        </button>
      </div>
    );
  }

  const isSubmitted = record.status === "SUBMITTED";

  return (
    <>
      <div className="font-layout-font">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <Title
            title="HR Management"
            sub_title="NMR Attendance"
            page_title="Attendance Details"
          />
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <ButtonBg
              button_icon={<ArrowLeft size={16} />}
              button_name="Back"
              bgColor="dark:bg-layout-dark bg-white"
              textColor="dark:text-white text-darkest-blue"
              onClick={() => navigate(-1)}
            />
            {isSubmitted && (
              <>
                <ButtonBg
                  button_icon={<Pencil size={16} />}
                  button_name="Edit"
                  onClick={() => setEditOpen(true)}
                />
                <ButtonBg
                  button_icon={<CheckCircle size={16} />}
                  button_name="Approve"
                  bgColor="bg-emerald-600"
                  textColor="text-white"
                  onClick={() =>
                    approveMutation.mutate({ id: record._id, verified_by: record.verified_by || "" })
                  }
                  disabled={approveMutation.isPending}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Summary Card */}
          <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <ClipboardList className="text-blue-500" size={20} />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Attendance Summary
              </h3>
              <span
                className={`ml-auto text-xs font-semibold px-2 py-1 rounded border ${
                  RECORD_STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {record.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <InfoBlock
                label="Date"
                value={new Date(record.attendance_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <InfoBlock label="Project ID" value={record.project_id} />
              <InfoBlock label="Contractor ID" value={record.contractor_id} />
              <InfoBlock label="Verified By" value={record.verified_by} />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <Users className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  Total Present
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {record.total_present ?? 0}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                <IndianRupee className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  Total Payable Amount
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  ₹{(record.total_payable_amount ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Worker Attendance Table */}
          <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <Users className="text-emerald-500" size={20} />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Worker Attendance ({record.attendance_list?.length || 0} workers)
              </h3>
            </div>
            <div className="overflow-auto no-scrollbar">
              <table className="w-full whitespace-nowrap text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="px-3 py-2 text-left">S.No</th>
                    <th className="px-3 py-2 text-left">Worker Name</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">In Time</th>
                    <th className="px-3 py-2 text-center">Out Time</th>
                    <th className="px-3 py-2 text-right">Daily Wage</th>
                    <th className="px-3 py-2 text-right">Payable</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  {record.attendance_list?.length > 0 ? (
                    record.attendance_list.map((worker, idx) => {
                      const payable =
                        worker.status === "PRESENT"
                          ? worker.daily_wage
                          : worker.status === "HALF_DAY"
                          ? (worker.daily_wage || 0) / 2
                          : 0;
                      return (
                        <tr
                          key={worker.worker_id || idx}
                          className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        >
                          <td className="px-3 py-2.5">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-medium">{worker.worker_name || "-"}</td>
                          <td className="px-3 py-2.5">{worker.category || "-"}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                                STATUS_STYLES[worker.status] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {worker.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">{worker.in_time || "-"}</td>
                          <td className="px-3 py-2.5 text-center">{worker.out_time || "-"}</td>
                          <td className="px-3 py-2.5 text-right">
                            {worker.daily_wage != null ? `₹${worker.daily_wage}` : "-"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium">
                            {payable != null ? `₹${payable}` : "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-gray-400">
                        No workers found in this record
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editOpen && (
        <EditNMRAttendance
          record={record}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
};

export default ViewNMRAttendance;
