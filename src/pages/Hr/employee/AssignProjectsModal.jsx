import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FolderOpen } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { api } from "../../../services/api";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const AssignProjectsModal = ({ employee, onclose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(
    (employee?.assignedProject || []).map((p) => (typeof p === "string" ? p : p._id))
  );
  const [search, setSearch] = useState("");

  const { data: tendersData, isLoading } = useQuery({
    queryKey: ["tenders-dropdown"],
    queryFn: async () => {
      const { data } = await api.get("/tender/list?limit=100");
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const tenders = (tendersData || []).filter((t) =>
    t.tender_project_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.tenderId?.toLowerCase().includes(search.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put("/employee/assign-projects", {
        employeeId: employee._id,
        assignedProject: selected,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Projects assigned successfully!");
      queryClient.invalidateQueries(["employees"]);
      if (onSuccess) onSuccess();
      onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to assign projects");
    },
  });

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <FolderOpen size={18} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Assign Projects</h2>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <IoClose size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
            <p className="font-semibold text-gray-800 dark:text-white">{employee?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{selected.length} project(s) selected</p>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))
            ) : tenders.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">No projects found</p>
            ) : (
              tenders.map((t) => {
                const isSelected = selected.includes(t._id);
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => toggle(t._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600"
                        : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-500"
                    }`}>
                      {isSelected && <span className="text-white text-[9px] font-bold">✓</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{t.tender_project_name}</p>
                      <p className="text-xs text-gray-400">{t.tenderId}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onclose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="px-6 py-2 text-sm bg-darkest-blue hover:bg-blue-900 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              Save Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignProjectsModal;
