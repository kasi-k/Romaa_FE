import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiFilterAlt } from "react-icons/bi";
import { Eye, CheckCircle } from "lucide-react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import Pagination from "../../../components/Pagination";
import Filters from "../../../components/Filters";
import Loader from "../../../components/Loader";
import { useProject } from "../../../context/ProjectContext";
import { useSearch } from "../../../context/SearchBar";
import { useNMRAttendanceList, useApproveNMRAttendance } from "./hooks/useNMRAttendance";
import { useDebounce } from "../../../hooks/useDebounce";

const STATUS_STYLES = {
  SUBMITTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const NMRAttendance = () => {
  const navigate = useNavigate();
  const { tenderId } = useProject();
  const { searchTerm } = useSearch();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterModal, setFilterModal] = useState(false);
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "", contractor_id: "" });

  const debouncedSearch = useDebounce(searchTerm, 500);
  const itemsPerPage = 10;

  const { data, isLoading, isFetching } = useNMRAttendanceList(tenderId, {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
    contractor_id: filterParams.contractor_id,
  });

  const approveMutation = useApproveNMRAttendance({});

  const records    = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const paginatedData = records;

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams((prev) => ({ ...prev, fromdate, todate }));
    setCurrentPage(1);
    setFilterModal(false);
  };

  const handleApprove = (e, record) => {
    e.stopPropagation();
    approveMutation.mutate({ id: record._id, verified_by: "" });
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <Title title="HR Management" sub_title="NMR Attendance" page_title="NMR Attendance" />
        <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-3">
          <ButtonBg
            button_icon={<BiFilterAlt size={20} />}
            button_name="Filter"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            onClick={() => setFilterModal(true)}
          />
        </div>
      </div>

      {!tenderId && (
        <div className="text-center text-gray-400 py-10 font-medium">
          No project selected. Please select a project first.
        </div>
      )}

      {tenderId && (
        <>
          {isLoading ? (
            <Loader />
          ) : (
            <div className="overflow-auto no-scrollbar">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="text-sm dark:bg-layout-dark bg-white border-b-[3px] dark:border-border-dark-grey border-light-blue text-center">
                    <th className="rounded-l-md px-4 py-3 text-left">S.No</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Contractor</th>
                    <th className="px-4 py-3">Total Present</th>
                    <th className="px-4 py-3">Payable Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="rounded-r-md px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-greyish dark:bg-layout-dark bg-white text-sm">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((record, idx) => (
                      <tr
                        key={record._id}
                        className="border-light-blue border-b-2 dark:border-border-dark-grey hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() =>
                          navigate("view", { state: { id: record._id, record } })
                        }
                      >
                        <td className="px-4 py-3 rounded-l-md">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(record.attendance_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">{record.contractor_id || "-"}</td>
                        <td className="px-4 py-3 text-center">{record.total_present ?? "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {record.total_payable_amount != null
                            ? `₹${record.total_payable_amount.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded border ${
                              STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 rounded-r-md">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              title="View Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("view", { state: { id: record._id, record } });
                              }}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Eye size={16} />
                            </button>
                            {record.status === "SUBMITTED" && (
                              <button
                                title="Approve"
                                onClick={(e) => handleApprove(e, record)}
                                disabled={approveMutation.isPending}
                                className="text-emerald-500 hover:text-emerald-700 disabled:opacity-50"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-gray-400 py-8 font-medium"
                      >
                        {isFetching ? "Loading..." : "No attendance records found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}

      {filterModal && (
        <Filters onclose={() => setFilterModal(false)} onFilter={handleFilter} />
      )}
    </div>
  );
};

export default NMRAttendance;
