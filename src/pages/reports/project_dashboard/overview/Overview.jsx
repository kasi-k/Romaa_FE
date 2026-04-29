import React from "react";
import { BiFilterAlt } from "react-icons/bi";
import Button from "../../../../components/Button";
import { scheduleData } from "../../../../components/Data";

import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const Overview = () => {
  return (
    <>
      <div className="grid grid-cols-12 mb-[100px] mt-6 gap-3">
        <div className="md:col-span-6 col-span-12 dark:bg-layout-dark  bg-white rounded-md">
          <div className=" flex justify-between items-center p-5 ">
            <p className="text-lg font-bold">Schedule based chart</p>
            <Button
              button_icon={<BiFilterAlt size={18} />}
              bgColor="bg-select-subbar"
              textColor="text-darkest-blue"
            />
          </div>
          <div className="flex justify-center items-center ">
            <BarChart
              width={600}
              height={280}
              data={scheduleData}
              margin={{ right: 60 }}
            >
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 50]} axisLine={false} tickLine={false} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                }}
                formatter={(value) => [`${value}`, "Value"]}
              />

              <Bar dataKey="value" fill="#4B0082" barSize={20} radius={4} />
            </BarChart>
          </div>
        </div>
        <div className="md:col-span-6 col-span-12 dark:bg-layout-dark bg-white rounded-md">
          <div className=" flex justify-between items-center p-5 ">
            <p className="text-lg font-bold">Budget flow chart</p>
            <Button
              button_icon={<BiFilterAlt size={18} />}
              bgColor="bg-select-subbar"
              textColor="text-darkest-blue"
            />
          </div>
          <div className="flex justify-center items-center ">
            <BarChart
              width={600}
              height={280}
              data={scheduleData}
              margin={{ right: 60 }}
            >
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 50]} axisLine={false} tickLine={false} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                }}
                formatter={(value) => [`${value}`, "Value"]}
              />

              <Bar dataKey="value" fill="#45b6fe" barSize={20} radius={4} />
            </BarChart>
          </div>
        </div>
        <div className="md:col-span-6 col-span-12 dark:bg-layout-dark bg-white rounded-md py-3">
          <div className=" flex justify-between items-center p-5 ">
            <p className="text-lg font-bold">Budget flow chart</p>
            <Button
              button_icon={<BiFilterAlt size={18} />}
              bgColor="bg-select-subbar"
              textColor="text-darkest-blue"
            />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={scheduleData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b5b95" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#6b5b95" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area
                type="linear"
                dataKey="value"
                stroke="#6b5b95"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="md:col-span-6 col-span-12 dark:bg-layout-dark bg-white rounded-md py-3">
          <div className=" flex justify-between items-center p-5 ">
            <p className="text-lg font-bold">Budget flow chart</p>
            <Button
              button_icon={<BiFilterAlt size={18} />}
              bgColor="bg-select-subbar"
              textColor="text-darkest-blue"
            />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={scheduleData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#45b6fe" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#45b6fe" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area
                type="linear"
                dataKey="value"
                stroke="#45b6fe"
                fillOpacity={1}
                fill="url(#colorBlue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default Overview;
