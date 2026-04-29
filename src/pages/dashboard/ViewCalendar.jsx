import React, { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
} from "date-fns";
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Title from "../../components/Title";
import Button from "../../components/Button";
import { TbCalendarDue } from "react-icons/tb";
import AddEvents from "./AddEvents";
import SearchableSelect from "../../components/SearchableSelect";

const Projectsdata = [
  { date: "2025-04-06", status: "Completed", name: "Foundation Work" },
  { date: "2025-04-08", status: "Work in progress", name: "Column Casting" },
  { date: "2025-04-10", status: "Completed", name: "Plinth Beam" },
  { date: "2025-04-13", status: "Work in progress", name: "Brick Masonry" },
  { date: "2025-04-19", status: "Completed", name: "Slab Shuttering" },
  {
    date: "2025-04-25",
    status: "Work in progress",
    name: "Roof Slab Concrete",
  },
  { date: "2025-04-30", status: "Completed", name: "Curing" },
  { date: "2025-05-02", status: "Work in progress", name: "Plastering" },
  { date: "2025-05-02", status: "Completed", name: "Flooring" },
  { date: "2025-05-15", status: "Work in progress", name: "Painting" },
  { date: "2025-05-03", status: "Work in progress", name: "Flooring" },
];

const statuses = {
  "Work in progress": " text-yellow-500",
  Completed: " text-green-600",
};

const barstatuses = {
  "Work in progress": "bg-yellow-500 ",
  Completed: "bg-green-600 ",
};

const ViewCalendar = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [addEvents, setAddEvents] = useState();
  const currentMonth = new Date(selectedYear, selectedMonth);
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  const years = Array.from({ length: 100 }, (_, i) => 1990 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const filteredProjects = Projectsdata.filter((appt) => {
    const apptDate = new Date(appt.date);
    return (
      apptDate.getMonth() === selectedMonth &&
      apptDate.getFullYear() === selectedYear
    );
  });

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <Title
          title="Dashboard"
          sub_title="Main Dashboard"
          page_title="Calendar"
        />
        <div className="flex gap-2 items-center">
          <Button
            button_name="Add Events"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            button_icon={<TbCalendarDue size={23} />}
            onClick={()=>{setAddEvents(true)}}
          />
        </div>
      </div>
      <div className="flex   dark:text-white text-black  ">
        <div className="w-2/3 px-1 ">
          <div className="flex justify-between my-1 dark:bg-layout-dark bg-white  rounded-md px-2 py-2 items-center ">
            <div className="flex gap-2">
              <SearchableSelect
                value={String(selectedMonth)}
                onChange={(val) => setSelectedMonth(Number(val))}
                options={months.map((month, idx) => ({ value: String(idx), label: month }))}
                placeholder="Select month"
              />

              <SearchableSelect
                value={String(selectedYear)}
                onChange={(val) => setSelectedYear(Number(val))}
                options={years.map((year) => ({ value: String(year), label: String(year) }))}
                placeholder="Select year"
              />
            </div>

            <span className="text-sm dark:text-white text-gray-400">Time zone</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center ">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-sm dark:bg-layout-dark bg-white rounded-md p-4 ">
                {day}
              </div>
            ))}
            {Array.from({
              length: start.getDay() === 0 ? 6 : start.getDay() - 1,
            }).map((_, i) => (
              <div key={`empty-${i}`} className=" dark:bg-layout-dark bg-white rounded-md"></div>
            ))}
            {days.map((day) => {
              // Find all projects for this day
              const appts = Projectsdata.filter((appt) =>
                isSameDay(new Date(appt.date), day)
              );
              const hasCompleted = appts.some(
                (appt) => appt.status === "Completed"
              );
              const hasProgress = appts.some(
                (appt) => appt.status === "Work in progress"
              );

              return (
                <div
                  key={day}
                  className="h-18 dark:bg-layout-dark bg-white rounded-md flex items-start relative"
                >
                  {/* Left vertical bar for Completed */}
                  {hasCompleted && (
                    <div className="absolute left-0 top-0 w-2 h-full rounded-l-sm bg-green-600" />
                  )}
                  {/* Bottom horizontal bar for Work in progress (only if both present) */}
                  {hasCompleted && hasProgress && (
                    <div className="absolute left-0 bottom-0 w-full h-2 rounded-b-sm bg-yellow-500" />
                  )}
                  {/* Only vertical bar for Work in progress if no completed */}
                  {!hasCompleted && hasProgress && (
                    <div className="absolute left-0 top-0 w-2 h-full rounded-l-sm bg-yellow-500" />
                  )}
                  <div className="flex justify-center items-center text-sm w-full h-full z-10">
                    {format(day, "dd")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-1/3 p-2 space-y-1">
          {filteredProjects.length === 0 ? (
            <div className="flex justify-center items-center h-32 dark:text-white text-gray-400 font-semibold dark:bg-layout-dark bg-white rounded-md">
              No data for this month
            </div>
          ) : (
            filteredProjects.map((appt, idx) => (
              <div
                key={idx}
                className="flex  justify-center items-center dark:bg-layout-dark bg-white  rounded-md space-x-3"
              >
                <div
                  className={`py-9 px-1 rounded-l-md ${
                    barstatuses[appt.status]
                  }`}
                ></div>
                <div className="flex-1 px-2 ">
                  {appt.status === "Completed" ? (
                    <>
                      <p className="font-semibold">{appt.name}</p>
                      <p className="text-xs text-gray-500">
                        Location: {appt.location || "Site A"}
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold">{appt.name}</p>
                  )}
                </div>
                <div className="flex flex-col items-end mx-2 ">
                  <p className="text-sm text-gray-400 mb-2">
                    {format(new Date(appt.date), "dd.MM.yyyy")}
                  </p>
                  <span
                    className={`text-sm  font-semibold px-2 ${
                      statuses[appt.status]
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-end  mb-8 relative ">
        <p
          onClick={() => navigate("..")}
          className=" cursor-pointer absolute flex items-center gap-2 bg-darkest-blue text-white rounded-sm py-1.5 px-4 -bottom-10 right-4 "
        >
          <IoArrowBackSharp /> back
        </p>
      </div>
      {addEvents && (
        <>
          <AddEvents onclose={()=>{setAddEvents(false)}}   />
        </>
      )}
    </>
  );
};

export default ViewCalendar;
