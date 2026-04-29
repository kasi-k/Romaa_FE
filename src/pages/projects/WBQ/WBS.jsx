import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ChevronRight, ChevronDown,
  FolderOpen, FileText, Hash,
  Download, Upload, Plus, MoreHorizontal, LayoutList
} from "lucide-react";
import { useProject } from "../../../context/ProjectContext";
import { API } from "../../../constant";
import UploadWBS from "./UploadWBS";
import { Loader2 } from "lucide-react";
import { TbFileExport } from "react-icons/tb";
import Button from "../../../components/Button";

// --- Helper: Flatten Structure ---
const flattenStructure = (groups) => {
  const rows = [];
  groups.forEach((group, gIndex) => {
    // Level 1: Group
    rows.push({
      id: `G-${gIndex}`,
      type: "group",
      name: group.group_name,
      wbs_code: String.fromCharCode(65 + gIndex),
      level: 0,
      row_index: group.row_index, // <--- Already captured here
      expanded: true,
      data: {
        quantity: group.quantity,
        unit: group.unit
      }
    });

    if (group.items) {
      group.items.forEach((item, iIndex) => {
        // Level 2: Item
        rows.push({
          id: `I-${gIndex}-${iIndex}`,
          parentId: `G-${gIndex}`,
          type: "item",
          name: item.item_name,
          wbs_code: `${String.fromCharCode(65 + gIndex)}.${iIndex + 1}`,
          level: 1,
          row_index: item.row_index,
          expanded: true,
          data: {
            quantity: item.quantity,
            unit: item.unit
          }
        });

        if (item.tasks) {
          item.tasks.forEach((task, tIndex) => {
            // Level 3: Task Container
            const taskId = `T-${gIndex}-${iIndex}-${tIndex}`;
            rows.push({
              id: taskId,
              parentId: `I-${gIndex}-${iIndex}`,
              type: "task",
              name: task.task_name,
              wbs_code: `${String.fromCharCode(65 + gIndex)}.${iIndex + 1}.${tIndex + 1}`,
              level: 2,
              row_index: task.row_index,
              expanded: true,
              data: {
                quantity: task.quantity,
                unit: task.unit
              }
            });

            const leaves = task.active_tasks || task.task_wbs_ids || [];
            leaves.forEach((leaf, lIndex) => {
              if (typeof leaf === 'object' && leaf !== null) {
                rows.push({
                  id: leaf.wbs_id,
                  parentId: taskId,
                  type: "leaf",
                  name: leaf.description,
                  wbs_code: leaf.wbs_id,
                  level: 3,
                  row_index: leaf.row_index,
                  data: {
                    unit: leaf.unit,
                    quantity: leaf.quantity,
                  }
                });
              }
            });
          });
        }
      });
    }
  });
  return rows;
};

const WBS = () => {
  const { tenderId } = useProject();
  const [flatRows, setFlatRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [showUpload, setShowUpload] = useState(false);

  const fetchWBS = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schedulelite/get-schedule/${tenderId}`);
      if (res.data?.data?.structure) {
        const flattened = flattenStructure(res.data.data.structure);
        setFlatRows(flattened);
        const initialExpanded = new Set();
        flattened.forEach(row => { if (row.type !== 'leaf') initialExpanded.add(row.id); });
        setExpandedIds(initialExpanded);
      }
    } catch (err) {
      toast.error("Failed to fetch WBS items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWBS(); }, [tenderId]);

  const toggleRow = (rowId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
  };

  const visibleRows = useMemo(() => {
    const visible = [];
    for (const row of flatRows) {
      if (!row.parentId) {
        visible.push(row);
      } else {
        let current = row;
        let isVisible = true;
        while (current.parentId) {
          if (!expandedIds.has(current.parentId)) {
            isVisible = false;
            break;
          }
          current = flatRows.find(r => r.id === current.parentId);
        }
        if (isVisible) visible.push(row);
      }
    }
    return visible;
  }, [flatRows, expandedIds]);

  const formatQuantity = (qty) => {
    if (qty === null || qty === undefined || qty === "") return "";
    return qty;
  };

  const handleClose = () => setShowUpload(false);

  return (
    <div className="flex flex-col h-full dark:bg-gray-900 font-roboto-flex text-sm">

      {/* --- Toolbar --- */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 ">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">Work Breakdown Structure</h1>
            <p className="text-sm py-1.5 text-gray-600">Tender {tenderId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            button_icon={<TbFileExport size={22} />}
            button_name="Upload"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            onClick={() => setShowUpload(true)}
          />
        </div>
      </div>

      {/* --- Data Grid --- */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-white">

        {/* --- Header --- */}
        <div className="grid grid-cols-12 gap-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 sticky top-0 z-20 py-1.5">
          {/* New Column: No. */}
          <div className="col-span-1 px-2 py-2 border-r border-gray-200 dark:border-gray-700 text-center">No.</div>
          {/* Reduced Structure column from 6 to 5 to fit 'No.' */}
          <div className="col-span-5 px-4 py-2 border-r border-gray-200 dark:border-gray-700">WBS Structure</div>
          <div className="col-span-2 px-2 py-2 border-r border-gray-200 dark:border-gray-700 text-center">Unit</div>
          <div className="col-span-2 px-2 py-2 border-r border-gray-200 dark:border-gray-700 text-right">Quantity</div>
          <div className="col-span-2 px-2 py-2 border-r border-gray-200 dark:border-gray-700 text-center">WBS Code</div>
        </div>

        {/* --- Rows --- */}
        <div className="overflow-y-auto flex-1 custom-scrollbar pb-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Loader2 className="animate-spin mb-2" /> Loading Data...
            </div>
          ) : (
            visibleRows.map((row) => {
              const isLeaf = row.type === 'leaf';
              const isExpanded = expandedIds.has(row.id);
              const indentSize = 24;
              const paddingLeft = row.level * indentSize + 12;

              // Row Styling
              const bgClass = isLeaf ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/30";
              const textClass = row.level === 0 ? "font-bold text-gray-800" : row.level === 1 ? "font-semibold text-red-700" : row.level === 2 ? "font-semibold text-slate-700" : "text-blue-500";
              const borderClass = "border-b border-gray-100 dark:border-gray-800";

              return (
                <div key={row.id} className={`grid grid-cols-12 gap-0 group hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${bgClass} ${borderClass} min-h-[36px]`}>

                  {/* 1. Row Index Column (New) */}
                  <div className="col-span-1 px-2 py-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800 text-xs text-gray-400 font-mono">
                    {row.row_index || "-"}
                  </div>

                  {/* 2. Structure Tree Column (Adjusted Width) */}
                  <div className="col-span-5 flex items-center relative border-r border-gray-100 dark:border-gray-800">
                    {row.level > 0 && Array.from({ length: row.level }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute h-full border-r border-gray-200 dark:border-gray-700"
                        style={{ left: `${i * indentSize + 23}px` }}
                      />
                    ))}

                    <div className="flex items-center w-full pr-2" style={{ paddingLeft: `${paddingLeft}px` }}>
                      {!isLeaf ? (
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="z-10 mr-1.5 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      ) : (
                        <span className="w-5 mr-1.5 inline-block"></span>
                      )}

                      <div className="flex items-center gap-2 truncate">
                        {!isLeaf && row.level === 0 && <FolderOpen size={14} className="text-blue-500" />}
                        <span className={`truncate text-sm ${textClass} dark:text-gray-200 `} title={row.name}>
                          {row.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Unit Column */}
                  <div className={`col-span-2 px-2 py-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800 text-sm ${textClass}`}>
                    {row.data?.unit || ""}
                  </div>

                  {/* 4. Quantity Column */}
                  <div className={`col-span-2 px-2 py-2 flex items-center justify-end border-r border-gray-100 dark:border-gray-800 font-mono text-sm ${textClass}`}>
                    {formatQuantity(row.data?.quantity || "")}
                  </div>

                  {/* 5. WBS Code Column */}
                  <div className="col-span-2 px-2 py-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800 font-mono text-xs text-gray-500 ">
                    {isLeaf ? (
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 text-center">
                        {row.wbs_code}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showUpload && <UploadWBS onclose={handleClose} onSuccess={() => { fetchWBS(); setShowUpload(false); }} />}
    </div>
  );
};

export default WBS;