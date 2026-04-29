import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SummaryCard from "../SummaryCard";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import { TbCalendarDue } from "react-icons/tb";
import { LuClipboardList } from "react-icons/lu";
import Schedule from "./TodaySchedule";
import WorkSchedule from "./WorkSchedule";
import MaterialRequest from "./MaterialRequest";
import MaterialRequestStatus from "./MaterialRequestStatus";
import { MdOutlineCheckCircle } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { TbCalendarTime } from "react-icons/tb";
import { RiMenuAddFill } from "react-icons/ri";
import { IoDiscOutline } from "react-icons/io5";
import { SlBadge } from "react-icons/sl";

const summaryData = [
  { title: "Verified", subtitle: "My Profile Status" },
  { title: "5h 20m", subtitle: "Today's Hours" },
  { title: "96%", subtitle: "Attendance This Month" },
  { title: "3", subtitle: "Tasks Due" },
  { title: "88%", subtitle: "Performance Score" },
  { title: "5", subtitle: "Appreciations" },
];

const todaySchedule = [
  { desc: "Retaining Wall", qty: 23, unit: "M3" },
  { desc: "Road Work", qty: 12, unit: "M3" },
  { desc: "New Intent", qty: 22, unit: "M3" },
];

const weeklySchedule = [
  { desc: "Retaining Wall", qty: 23, Mon: 2, Tue: 2, Wed: 2, Thu: 2, Fri: 2 },
  { desc: "Road Work", qty: 22, Mon: 2, Tue: 2, Wed: 2, Thu: 2, Fri: 2 },
  { desc: "New Intent", qty: 23, Mon: 2, Tue: 2, Wed: 2, Thu: 2, Fri: 2 },
];

const materials = [
  { name: "Cement", qty: 500, unit: "Bags", status: "Approved" },
  { name: "Cement", qty: 500, unit: "Bags", status: "Approved" },
  { name: "Cement", qty: 500, unit: "Bags", status: "Approved" },
];

const requests = Array(5).fill({
  id: "MRQ-001",
  machine: "CAT 320 Excavator",
  location: "Tower A Foundation",
  date: "1.07.2025",
  status: "Approved",
  remarks: "Waiting",
});

const datachart = [
  { name: "1", value: 30 },
  { name: "2", value: 40 },
  { name: "3", value: 80 },
  { name: "4", value: 60 },
  { name: "5", value: 70 },
  { name: "6", value: 90 },
  { name: "7", value: 100 },
];

const EmployeeDashboard = () => {
  return (
    <div className="h-full pb-16">
      <div className="flex justify-between items-center ">
        <Title
          title="Dashboard"
          sub_title="Main Dashboard"
          page_title="Main Dashboard"
        />
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => navigate("viewcalendar")}
            button_name="Calendar"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            button_icon={<TbCalendarDue size={23} />}
            paddingY="py-2.5"
          />
          <Button
            onClick={() => setViewWorkOrderModal(true)}
            button_name="Task Assigned"
            bgColor=" dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            button_icon={<LuClipboardList size={23} />}
            paddingY="py-2.5"
          />
        </div>
      </div>
      <div className="mt-4 space-y-2 overflow-y-auto h-full no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <SummaryCard
            title="My Profile Status"
            value="Verified"
            status="KYC is Complete"
            icon={<MdOutlineCheckCircle size={24} color="#2A848D" />}
          />
          <SummaryCard
            title="Today's working hours"
            value="5h 20m"
            status="Today's Hours"
            icon={<IoMdTime size={24} color="#2A848D" />}
          />
          <SummaryCard
            title="Attendance This month "
            value="96%"
            status="Overview"
            icon={<TbCalendarTime size={24} color="#2A848D" />}
          />
          <SummaryCard title="Task Due" value="3" status=" Task Remainder" icon={<RiMenuAddFill size={24} color="#2A848D"/>} />
          <SummaryCard title="Perfomance Score" value="88%" status=" Score" icon={<IoDiscOutline size={24} color="#2A848D"/>} />
          <SummaryCard title="Appreciations" value="5" status=" Count" icon={<SlBadge size={24} color="#2A848D"/>} />
        </div>

        {/* Schedule + Material */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Schedule */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <Schedule />

            <WorkSchedule />
          </div>

          <MaterialRequest />
        </div>

        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-8 dark:bg-layout-dark bg-white p-4 rounded-md shadow">
            <MaterialRequestStatus />
          </div>
          <div className=" dark:bg-layout-dark bg-white col-span-4 p-4 rounded-md shadow">
            <h3 className="font-semibold mb-10">Current Project Status</h3>
            <ResponsiveContainer width="100%" height={240} >
              <BarChart data={datachart}    margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                   interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#5E52CE" barSize={20} radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
