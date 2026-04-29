import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../../constant";
import { toast } from "react-toastify";
import { FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiClock } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchableSelect from "../../../../components/SearchableSelect";

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [holidaysMap, setHolidaysMap] = useState(new Map());
  const [balance, setBalance] = useState(0);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [overlapHolidays, setOverlapHolidays] = useState([]);
  
  // Error States
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

const initialFormState = {
    leaveType: "CL",
    requestType: "Full Day",
    fromDate: "",
    toDate: "",
    reason: "",
    totalDays: 0,
    fromTime: "",
    toTime: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleClose = () => {
    setFormData(initialFormState); // Reset Form
    setDateError("");              // Clear Errors
    setTimeError("");
    setOverlapHolidays([]);        // Clear Holiday warnings
    onClose();                     // Trigger Parent Close
  };

  // --- 1. Load Data ---
  useEffect(() => {
    if (isOpen) {
      const fetchHolidays = async () => {
        try {
          const res = await axios.get(`${API}/calendar/listall?year=${viewYear}`, { withCredentials: true });
          if (res.data.success) {
            const hMap = new Map();
            res.data.data.forEach(h => {
               const d = new Date(h.date).toISOString().split('T')[0];
               hMap.set(d, h.name || "Holiday");
            });
            setHolidaysMap(hMap);
          }
        } catch (error) { console.error(error); }
      };

      if (user && user.leaveBalance) {
          // If "Permission" is selected (visually), we don't show a balance, otherwise show bucket balance
          setBalance(user.leaveBalance[formData.leaveType] || 0);
      }
      fetchHolidays();
    }
  }, [isOpen, viewYear]);

  useEffect(() => {
      if (user && user.leaveBalance && isOpen) {
          setBalance(user.leaveBalance[formData.leaveType] || 0);
      }
  }, [isOpen, user, formData.leaveType]);

  // --- 2. Smart Calculation ---
  const calculateSmartDays = (start, end, type) => {
    if(!start || !end) return { days: 0, holidaysFound: [] };
    
    // Permission is always 0 days
    if (type === "Short Leave") return { days: 0, holidaysFound: [] };

    const s = new Date(start);
    const e = new Date(end);
    
    if (s > e) {
        setDateError("End date cannot be before Start date");
        return { days: 0, holidaysFound: [] };
    }
    setDateError("");

    let count = 0;
    let loop = new Date(s);
    const foundHolidays = [];

    while(loop <= e) {
        const dateStr = loop.toISOString().split('T')[0];
        if (holidaysMap.has(dateStr)) {
            foundHolidays.push({ date: dateStr, name: holidaysMap.get(dateStr) });
        } else {
            count += (type === "Full Day" ? 1 : 0.5);
        }
        loop.setDate(loop.getDate() + 1);
    }
    return { days: count, holidaysFound: foundHolidays };
  };

  // --- 3. Time Duration Check ---
  const validateTime = (start, end) => {
      if(!start || !end) return "";
      
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      
      const totalMinutes1 = h1 * 60 + m1;
      const totalMinutes2 = h2 * 60 + m2;
      const diff = totalMinutes2 - totalMinutes1;

      if (diff <= 0) return "End time must be after Start time";
      if (diff > 120) return "Permission cannot exceed 2 Hours";
      
      return "";
  };

  // --- 4. Handle Changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };

    // --- LOGIC: If "Permission" is selected in Leave Type ---
    if (name === "leaveType" && value === "Permission") {
        // Force Request Type to Short Leave
        newData.requestType = "Short Leave";
        // Permissions are single day, so sync dates
        if(newData.fromDate) newData.toDate = newData.fromDate;
    }

    if (name === "leaveType" && value === "CompOff") {
        // Force Request Type to Full Day
        newData.requestType = "Full Day";
    }
    
    // Update Balance Display
    if (name === "leaveType" && value !== "Permission" && user?.leaveBalance) {
        setBalance(user.leaveBalance[value] || 0);
    }
    
    // Sync Calendar View
    if (name === "fromDate" && value) {
        const d = new Date(value);
        setViewMonth(d.getMonth());
        setViewYear(d.getFullYear());
        
        // If Permission, force ToDate = FromDate
        if (newData.requestType === "Short Leave") {
            newData.toDate = value;
        }
    }

    // Force ToDate to equal FromDate if Request Type is Short Leave
    if (name === "requestType" && value === "Short Leave") {
        newData.toDate = newData.fromDate;
    }

    // --- TIME VALIDATION ---
    if (name === "fromTime" || name === "toTime" || (name === "requestType" && value === "Short Leave")) {
        const err = validateTime(
            name === "fromTime" ? value : newData.fromTime,
            name === "toTime" ? value : newData.toTime
        );
        setTimeError(err);
    }

    // --- RECALCULATE DAYS ---
    if(name === "fromDate" || name === "toDate" || name === "requestType" || name === "leaveType") {
       const { days, holidaysFound } = calculateSmartDays(
           newData.fromDate || formData.fromDate, 
           newData.toDate || formData.toDate, 
           newData.requestType || formData.requestType
       );
       newData.totalDays = days;
       setOverlapHolidays(holidaysFound);
       
       // HOLIDAY CHECK FOR PERMISSION
       if (newData.requestType === "Short Leave" && newData.fromDate) {
           if(holidaysMap.has(newData.fromDate)) {
               setDateError("Permissions allowed on Working Days only.");
           } else {
               setDateError(""); // Clear error if valid
           }
       }
    }
    
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateError || timeError) return;

    // Validation for Short Leave
    if (formData.requestType === "Short Leave") {
        if (!formData.fromTime || !formData.toTime) {
            toast.error("Please select Start and End time.");
            return;
        }
        // Double check holiday
        if (holidaysMap.has(formData.fromDate)) {
             toast.error("Permissions allowed on Working Days only.");
             return;
        }
    }
    
    // Balance Check (Skip for Short Leave)
    if (formData.requestType !== "Short Leave" && formData.leaveType !== "LWP" && formData.leaveType !== "Permission" && formData.totalDays > balance) {
        toast.error(`Insufficient ${formData.leaveType} Balance!`);
        return;
    }

    setLoading(true);
    
    // Prepare Payload
    // Note: If "Permission" was selected in UI, map it to "LWP" or keep as "Permission" depending on backend enum.
    // Assuming backend needs "LWP" + "Short Leave" or supports "Permission" enum. 
    // We send whatever is in state, but usually Permission implies no balance deduction.
    const payload = {
        employeeId: user._id,
        leaveType: formData.leaveType,
        requestType: formData.requestType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        totalDays: formData.totalDays,
        reason: formData.reason,
        shortLeaveTime: formData.requestType === "Short Leave" ? {
            from: formData.fromTime,
            to: formData.toTime
        } : null
    };

    try {
      await axios.post(`${API}/leave/apply`, payload, { withCredentials: true });
      toast.success("Request Submitted Successfully!");
      onSuccess();
     handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto font-layout-font">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up flex flex-col md:flex-row">
        
        {/* --- LEFT: Form Section --- */}
        <div className="w-full md:w-1/2 p-6 border-r border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 text-lg">Apply for Leave</h3>
                <button onClick={onClose} className="md:hidden"><FiX className="text-gray-500" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Leave Type</label>
                        <SearchableSelect
                            value={formData.leaveType}
                            onChange={(val) => handleChange({ target: { name: "leaveType", value: val } })}
                            options={[
                              { value: "CL", label: "Casual Leave (CL)" },
                              { value: "SL", label: "Sick Leave (SL)" },
                              { value: "PL", label: "Privilege Leave (PL)" },
                              { value: "LWP", label: "Loss of Pay (LWP)" },
                              { value: "CompOff", label: "Compensatory Leave (CompOff)" },
                              { value: "Permission", label: "Permission" },
                            ]}
                            placeholder="Select Leave Type"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Request Duration</label>
                        <SearchableSelect
                            value={formData.requestType}
                            onChange={(val) => handleChange({ target: { name: "requestType", value: val } })}
                            disabled={formData.leaveType === "Permission" || formData.leaveType === "CompOff"}
                            options={[
                              { value: "Full Day", label: "Full Day" },
                              { value: "First Half", label: "First Half" },
                              { value: "Second Half", label: "Second Half" },
                              { value: "Short Leave", label: "Short Leave (Permission)" },
                            ]}
                            placeholder="Select Duration"
                        />
                    </div>
                </div>

                {/* --- DATE INPUTS --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">From Date</label>
                        <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} required className={`w-full border rounded-lg p-2 text-sm ${dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">To Date</label>
                        <input 
                            type="date" 
                            name="toDate" 
                            value={formData.toDate} 
                            onChange={handleChange} 
                            required 
                            // Disable ToDate for Short Leave (must be same day)
                            disabled={formData.requestType === "Short Leave"}
                            className={`w-full border rounded-lg p-2 text-sm ${dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${formData.requestType === "Short Leave" ? "bg-gray-100 cursor-not-allowed" : ""}`} 
                        />
                    </div>
                </div>

                {/* --- TIME INPUTS (Only for Short Leave) --- */}
                {formData.requestType === "Short Leave" && (
                    <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg border animate-fade-in-down ${timeError ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-100"}`}>
                        <div className={`col-span-2 flex items-center gap-2 text-xs font-medium pb-1 ${timeError ? "text-red-700" : "text-yellow-700"}`}>
                            <FiClock /> 
                            {timeError ? timeError : "Permission Timing (Max 2 Hours)"}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">From Time</label>
                            <input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">To Time</label>
                            <input type="time" name="toTime" value={formData.toTime} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white" />
                        </div>
                    </div>
                )}

                {dateError && (
                    <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs flex items-center gap-2">
                        <FiAlertTriangle /> {dateError}
                    </div>
                )}

                {/* --- Balance & Days Calculation --- */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Calculated Days:</span>
                        <span className="font-bold text-gray-900 text-lg">
                            {formData.requestType === "Short Leave" ? "0 (Permission)" : formData.totalDays}
                        </span>
                    </div>
                    
                    {/* Hide Balance Check for Short Leave or LWP */}
                    {formData.requestType !== "Short Leave" && formData.leaveType !== "LWP" && formData.leaveType !== "Permission" && (
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200">
                            <span className="text-gray-500">Available Balance ({formData.leaveType}):</span>
                            <span className={`font-bold ${balance < formData.totalDays ? "text-red-600" : "text-green-600"}`}>
                                {balance} Days
                            </span>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Reason</label>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="2" className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none" placeholder="Enter detailed reason..."></textarea>
                </div>

                <div className="pt-2 flex gap-3 justify-end mt-auto">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button 
                        type="submit" 
                        // Disable if: Loading OR Date Error OR Time Error OR (Regular Leave AND Insufficient Balance)
                        disabled={loading || !!dateError || !!timeError || (formData.requestType !== "Short Leave" && formData.leaveType !== "LWP" && formData.leaveType !== "Permission" && formData.totalDays > balance)} 
                        className="px-6 py-2 text-sm bg-darkest-blue text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                    >
                    {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>

        {/* --- RIGHT: Mini Calendar --- */}
        <div className="w-full md:w-1/2 bg-gray-50/50 p-6 flex flex-col border-l border-gray-100">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Calendar Preview</h4>
                <div className="flex gap-2 items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                   <button onClick={() => { if(viewMonth===0){ setViewMonth(11); setViewYear(y=>y-1)} else { setViewMonth(m=>m-1)} }} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft size={16}/></button>
                   <span className="text-xs font-semibold w-24 text-center text-gray-800">{new Date(viewYear, viewMonth).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                   <button onClick={() => { if(viewMonth===11){ setViewMonth(0); setViewYear(y=>y+1)} else { setViewMonth(m=>m+1)} }} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronRight size={16}/></button>
                </div>
            </div>
            
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <MiniCalendar month={viewMonth} year={viewYear} holidaysMap={holidaysMap} fromDate={formData.fromDate} toDate={formData.toDate} />
            </div>

            {/* Legend / Info */}
            <div className="mt-4">
                 {formData.requestType === "Short Leave" ? (
                     <div className={`flex items-start gap-2 p-3 text-xs rounded-lg border ${timeError || dateError ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
                        <FiInfo className="mt-0.5 shrink-0" /> 
                        <span>
                            <strong>Note:</strong> You can take up to 3 permissions per month (Max 2 hrs each). Permissions do not deduct from your leave balance.
                        </span>
                     </div>
                 ) : null}
            </div>

            {overlapHolidays.length > 0 ? (
                <div className="mt-4 animate-fade-in-up">
                    <h5 className="text-xs font-bold text-gray-500 mb-2 uppercase flex items-center gap-1">
                        <FiInfo /> Holidays in Selection
                    </h5>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 max-h-32 overflow-y-auto custom-scrollbar">
                        {overlapHolidays.map((h, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-orange-800 mb-1 last:mb-0">
                                <span className="font-medium">{new Date(h.date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</span>
                                <span>{h.name}</span>
                            </div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-orange-200 text-[10px] text-orange-600 text-center italic">
                            * These days are automatically excluded from calculation
                        </div>
                    </div>
                </div>
            ) : formData.totalDays > 0 && (
                 <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100">
                    <FiCheckCircle /> 
                    <span>Great! All selected days are working days.</span>
                 </div>
            )}
             
             {/* Legend */}
            <div className="mt-auto pt-4 flex gap-4 text-[10px] justify-center text-gray-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-100 border border-red-300 rounded"></div> Holiday</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded"></div> Selected</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded"></div> Excluded</div>
            </div>
        </div>
      </div>
    </div>
  );
};

// ... (MiniCalendar Component remains exactly the same) ...
const MiniCalendar = ({ month, year, holidaysMap, fromDate, toDate }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); 
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const isDateSelected = (day) => {
        if (!fromDate || !day) return false;
        const current = new Date(year, month, day);
        const start = new Date(fromDate);
        const end = toDate ? new Date(toDate) : start;
        current.setHours(0,0,0,0); start.setHours(0,0,0,0); end.setHours(0,0,0,0);
        return current >= start && current <= end;
    };

    const isHoliday = (day) => {
        if (!day) return false;
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return holidaysMap.has(`${year}-${mm}-${dd}`);
    };

    return (
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="font-bold text-gray-400 py-1.5">{d}</div>
            ))}
            
            {days.map((day, idx) => {
                if (!day) return <div key={idx}></div>;
                const holiday = isHoliday(day);
                const selected = isDateSelected(day);
                let bgClass = "text-gray-700 hover:bg-gray-50";
                
                if (holiday && selected) bgClass = "bg-orange-400 text-white shadow-sm"; 
                else if (selected) bgClass = "bg-blue-600 text-white shadow-md shadow-blue-200"; 
                else if (holiday) bgClass = "bg-red-50 text-red-500 font-medium"; 

                return <div key={idx} className={`rounded-lg py-1.5 transition-all cursor-default ${bgClass}`}>{day}</div>;
            })}
        </div>
    );
};

export default ApplyLeaveModal;