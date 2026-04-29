import React, { useState, useEffect } from "react";
import { X, Clock, Link as LinkIcon } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import Button from "../../../../../../components/Button";

const EditScheduleModal = ({ isOpen, onClose, rowData, onSubmit, isSubmitting }) => {
  // State to toggle between editing modes
  const [editMode, setEditMode] = useState("duration"); // 'duration' or 'predecessor'
  
  const [duration, setDuration] = useState("");
  const [predecessor, setPredecessor] = useState("");

  // Initialize state when rowData changes
  useEffect(() => {
    if (rowData) {
      setDuration(rowData.rev_duration || rowData.duration || 0);
      setPredecessor(rowData.predecessor || "");
      // Default to duration, or keep previous selection? Resetting to duration is safer.
      setEditMode("duration");
    }
  }, [rowData]);

  if (!isOpen || !rowData) return null;

  const handleSubmit = () => {
    // CASE 1: Edit Duration Mode
    if (editMode === "duration") {
      const originalDuration = rowData.rev_duration || rowData.duration || 0;
      
      // Only submit if value actually changed
      if (Number(duration) !== Number(originalDuration)) {
        onSubmit({
          row_index: rowData.row_index,
          revised_duration: Number(duration)
        });
      } else {
        onClose(); // No change made
      }
    } 
    
    // CASE 2: Edit Predecessor Mode
    else if (editMode === "predecessor") {
      const originalPred = rowData.predecessor || "";
      
      // Only submit if value actually changed
      if (predecessor !== originalPred) {
        onSubmit({
          row_index: rowData.row_index,
          predecessor: predecessor
        });
      } else {
        onClose(); // No change made
      }
    }
  };

  // Helper to format read-only dates
  const displayDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, "dd MMM yyyy") : "-";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Edit Schedule Activity</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Read-Only Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Activity Name</label>
              <div className="font-medium text-gray-700 dark:text-gray-200">{rowData.name}</div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Row Index</label>
              <div className="font-mono text-gray-600 dark:text-gray-300">{rowData.row_index}</div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Current Start End</label>
              <div className="text-gray-600 dark:text-gray-300">{displayDate(rowData.rev_start || rowData.start)} - {displayDate(rowData.rev_end || rowData.end)}</div>
            </div>
          </div>

          {/* --- SELECTION TOGGLE --- */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">What do you want to edit?</label>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button 
                onClick={() => setEditMode("duration")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  editMode === "duration" 
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <Clock size={16} /> Duration
              </button>
              <button 
                onClick={() => setEditMode("predecessor")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  editMode === "predecessor" 
                    ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <LinkIcon size={16} /> Predecessor
              </button>
            </div>
          </div>

          {/* --- EDITABLE INPUT AREA --- */}
          <div className="min-h-[80px]">
            {editMode === "duration" ? (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Revised Duration (Days)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 rounded border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-gray-800 outline-none transition-all font-mono text-sm"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">Changing duration will recalculate the End Date.</p>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                  Revised Predecessor
                </label>
                <input
                  type="text"
                  value={predecessor}
                  onChange={(e) => setPredecessor(e.target.value)}
                  placeholder="e.g. 5FS+2"
                  className="w-full p-2 rounded border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-gray-800 outline-none transition-all font-mono text-sm uppercase"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">Format: RowIndex + Relation + Lag (e.g., 5FS+2)</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
          <Button 
            button_name="Cancel" 
            bgColor="bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600" 
            textColor="text-gray-700 dark:text-gray-300" 
            onClick={onClose} 
          />
          <Button 
            button_name={isSubmitting ? "Saving..." : "Save Changes"} 
            bgColor={editMode === "duration" ? "bg-blue-600" : "bg-orange-600"}
            textColor="text-white" 
            onClick={handleSubmit}
            disabled={isSubmitting} 
          />
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;