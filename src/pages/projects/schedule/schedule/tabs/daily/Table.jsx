import { format } from "date-fns";
import React from "react";

const ScheduleMetaCard = ({ meta }) => {
  if (!meta) return null;

  return (
    <div
      className=" my-3
      flex flex-wrap gap-4
      bg-white
       dark:bg-layout-dark
      border border-indigo-100 dark:border-border-dark-grey 
      rounded-xl p-5   mx-auto
      transition-all
    "
    >
      <div className="min-w-[170px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Project Name
        </div>
        <div className="font-bold text-lg text-blue-800 dark:text-darkest-blue">
          {meta.projectName}
        </div>
      </div>
      <div className="min-w-[170px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Tender Value
        </div>
        <div className="font-bold text-base text-green-700 dark:text-green-300">
          ₹ {meta.agreementValue?.toLocaleString()}
        </div>
      </div>
      <div className="min-w-[170px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Work Order Date
        </div>
        <div className="font-semibold text-blue-700 dark:text-blue-200">
          {format(new Date(meta.workOrderDate), "dd-MM-yyyy")}
        </div>
      </div>
      <div className="min-w-[170px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Agreement Date
        </div>
        <div className="font-semibold text-blue-700 dark:text-blue-200">
          {meta.aggDate ? format(new Date(meta.aggDate), "dd-MM-yyyy") : "-"}
        </div>
      </div>
      <div className="min-w-[170px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Planned Completion
        </div>
        <div className="font-semibold text-violet-900 dark:text-violet-300">
          {format(new Date(meta.plannedCompletionDate), "dd-MM-yyyy")}
        </div>
      </div>
      <div className="min-w-[170px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Project End Date
        </div>
        <div className="font-semibold text-red-700 dark:text-red-300">
          {format(new Date(meta.projectEndDate), "dd-MM-yyyy")}
        </div>
      </div>
      <div className="min-w-[170px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Report Date
        </div>
        <div className="font-semibold text-yellow-700 dark:text-yellow-200">
          {format(new Date(meta.reportDate), "dd-MM-yyyy")}
        </div>
      </div>
    </div>
  );
};

export default ScheduleMetaCard;
