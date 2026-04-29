import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";

const scheduleData = [
  {
    title: "Retaining Wall",
    children: [
      { desc: "Earthwork", qty: 23, unit: "Bags" },
      { desc: "Shear key Reinforcement", qty: 23, unit: "Bags" },
    ],
  },
  {
    title: "Road Work",
    children: [{ desc: "Sub-base Preparation", qty: 15, unit: "Bags" }],
  },
  {
    title: "New Intent",
    children: [{ desc: "Formwork", qty: 10, unit: "Bags" }],
  },
];

const TodaySchedule = () => {
  const [expanded, setExpanded] = useState({});

  const toggleRow = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="dark:bg-layout-dark bg-white p-2 rounded-md shadow  h-full overflow-x-auto no-scrollbar">
      <h3 className="font-semibold mb-4 text-lg border-b border-input-bordergrey dark:border-border-dark-grey p-4">Today’s Schedule</h3>
      <table className="w-full text-sm ">
        <thead>
          <tr className=" text-black dark:text-white border-b border-input-bordergrey dark:border-border-dark-grey ">
            <th className="px-2 ">
              <p className="flex items-center gap-2">Description{" "}
              <HiArrowsUpDown />
              </p>
            </th>
            <th>
              {" "}
              <p className="flex items-center gap-2">Quantity
              <HiArrowsUpDown />
              </p>
            </th>
            <th>
              <p className="flex items-center gap-2">Units{" "}
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {scheduleData.map((row, index) => (
            <React.Fragment key={index}>
              {/* Parent row */}
              <tr className=" border-b dark:border-border-dark-grey border-input-bordergrey">
                <td className="px-4 py-2 font-medium">{row.title}</td>
                <td></td>
                <td></td>
                <td>
                  <button
                    className="bg-blue-300 rounded text-blue-500 p-0.5"
                    onClick={() => toggleRow(index)}
                  >
                    {expanded[index] ? (
                      <ChevronUp className=" cursor-pointer w-5 h-5" />
                    ) : (
                      <ChevronDown className=" cursor-pointer w-5 h-5" />
                    )}
                  </button>
                </td>
              </tr>

              {/* Child rows */}
              {expanded[index] &&
                row.children.map((child, cidx) => (
                  <tr key={cidx} className="bg-gray-100 text-gray-800">
                    <td className="pl-6 py-2">{child.desc}</td>
                    <td>{child.qty}</td>
                    <td>{child.unit}</td>
                    <td></td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodaySchedule;
