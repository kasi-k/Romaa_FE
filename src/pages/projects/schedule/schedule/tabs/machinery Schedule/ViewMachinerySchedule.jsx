import React, { useState } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../../../../components/Title";
import Button from "../../../../../../components/Button";


const ViewMachinerySchedule = () => {
  const location = useLocation();
  const rowData = location.state?.item;
  const navigate = useNavigate();

  const [data, setData] = useState(
    rowData
      ? {
          0: [
            {
              label: "Machine Name",
              value: rowData.machineName,
              key: "machineName",
            },
            { label: "Assigned Site ", value: rowData.assignedSite, key: "assignedSite" },
            { label: "Start Date", value: rowData.startDate, key: "startDate" },
            { label: "Working Hours", value: rowData.workingHours, key: "workingHours" },
            { label: "Status", value: rowData.status, key: "status" },
          ],
        }
      : {}
  );

  const renderField = (field) => {
    return <p className="text-xs opacity-50">{field.value}</p>;
  };

  return (
    <>
      <div className="  h-full ">
        <div className="h-1/12">
          <Title
            title="Projects Management"
            sub_title="Schedule "
            active_title={"  Mechinery Schedule"}
          />
        </div>
        <div className="overflow-auto h-11/12 no-scrollbar">
          <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-6">
            <p className=" flex justify-center text-xl font-semibold">Mechinery Schedule</p>
            <div className="grid grid-cols-12 gap-2 items-start">
              {Object.entries(data).map(([section, fields]) => (
                <React.Fragment key={section}>
                  {fields.map((field) => (
                    <React.Fragment key={field.key}>
                      <p className="col-span-4 font-medium">{field.label}</p>
                      <div className="col-span-8">
                        {renderField(field, section)}
                      </div>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        

          <div className="flex justify-end py-2 ">
            <Button
              onClick={() => navigate("..?tab=2")}
              button_name="Back"
              button_icon={<IoChevronBackSharp />}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewMachinerySchedule;


