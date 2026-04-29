import React, { useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HiChevronDown } from "react-icons/hi2";
import { CiCalendar } from "react-icons/ci";

const data = [
  { week: 1, planned: 10, actual: 35 },
  { week: 2, planned: 30, actual: 25 },
  { week: 3, planned: 20, actual: 85 },
  { week: 4, planned: 40, actual: 80 },
  { week: 5, planned: 100, actual: 80 },
  { week: 6, planned: 70, actual: 55 },
  { week: 7, planned: 40, actual: 70 },
  { week: 8, planned: 0, actual: 45 },
  { week: 9, planned: 45, actual: 65 },
  { week: 10, planned: 30, actual: 100 },
];

const LineCharts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Month");
  const [date, setDate] = useState("2025-05-05");
  const dateInputRef = useRef(null);

  const options = ["Month", "Quarter", "Year"];

  return (
    <div className="dark:bg-layout-dark bg-white p-6 rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Planned vs Actual{" "}
          <span className="font-normal text-sm">(Project Name)</span>
        </h2>
        <div className="flex gap-3">
          <div className="relative w-36 text-sm">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="w-full h-10 flex justify-between items-center pl-3 border dark:border-border-dark-grey border-[#cdd3ff] rounded-md dark:text-white text-gray-600"
            >
              {selected}
              <span className="flex items-center justify-center rounded-md dark:bg-overall_bg-dark bg-[#D0D6FF] w-11 h-10">
                <HiChevronDown
                  className={`transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </span>
            </button>
            {isOpen && (
              <ul className="absolute z-10 mt-1 w-full dark:bg-layout-dark bg-white border border-[#cdd3ff] rounded-md shadow dark:text-white text-gray-700">
                {options.map((option) => (
                  <li
                    key={option}
                    onClick={() => {
                      setSelected(option);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 dark:hover:bg-overall_bg-dark hover:bg-[#eef0ff] cursor-pointer ${
                      option === selected ? "font-semibold text-[#4c52ff]" : ""
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex w-36 h-10 rounded-md border  dark:border-border-dark-grey border-[#cdd3ff] overflow-hidden text-sm relative">
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-3 outline-none appearance-none dark:text-white text-gray-600 dark:bg-layout-dark bg-white h-full"
              style={{ WebkitAppearance: "none", MozAppearance: "none" }}
            />
            <span
              className="absolute right-0 top-0 h-full w-10 flex items-center justify-center dark:bg-overall_bg-dark bg-[#D0D6FF] cursor-pointer"
              tabIndex={-1}
              onClick={
                () =>
                  dateInputRef.current && dateInputRef.current.showPicker
                    ? dateInputRef.current.showPicker() // Modern browsers
                    : dateInputRef.current && dateInputRef.current.focus() // Fallback
              }
            >
              <CiCalendar className="dark:text-white text-[#1f2937]" size={20} />
            </span>
          </div>
        </div>
      </div>
      <div className="relative w-full h-full">
        <span className="absolute bottom-32 right-8 text-xs opacity-60 ">
          X - Week
        </span>
        <span className="absolute bottom-26 right-0 text-xs opacity-60">
          Y - Percentage
        </span>

        <ResponsiveContainer width="90%" height={300}>
          <LineChart data={data}>
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              padding={{ left: 40 }}
              tick={{ fontSize: 10 }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line
              dataKey="actual"
              stroke="#00B0FF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="planned"
              stroke="#7ED321"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineCharts;
