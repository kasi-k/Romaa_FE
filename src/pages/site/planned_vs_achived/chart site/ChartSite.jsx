import React from "react";
import { FaAngleDown } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { scheduleData } from "../../../../components/Data";
import LineCharts from "../../../../components/LineChart";

const ChartSite = () => {
  return (
    <div>
      <div className="grid grid-cols-12 gap-3 ">
        <div className="col-span-6">
          <LineCharts />
        </div>
        <div className="col-span-6 dark:bg-layout-dark bg-white rounded-md pb-2">
          <div className=" flex justify-between items-center  p-5 ">
            <p className="text-lg font-bold">
              Planned vs Actual{" "}
              <span className="font-light text-base">(project name)</span>
            </p>
            <div className="w-72 flex rounded-md border border-gray-300  justify-between items-center">
              <input
                type="text"
                className="dark:bg-layout-dark bg-white w-full rounded-l-md placeholder:text-sm px-3 py-2 pl-6"
                placeholder="Project Name"
              />
              <p className="bg-select-subbar text-darkest-blue rounded-r-md py-3 px-3">
                <FaAngleDown />
              </p>
            </div>
          </div>

          <>
            <BarChart
              width={600}
              height={260}
              data={scheduleData}
              margin={{ right: 30 }}
            >
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                }}
                formatter={(value) => [`${value}`, "Value"]}
              />

              <Bar dataKey="value" fill="#4B0082" barSize={20} radius={4} />
            </BarChart>
          </>
        </div>
      </div>
    </div>
  );
};

export default ChartSite;
