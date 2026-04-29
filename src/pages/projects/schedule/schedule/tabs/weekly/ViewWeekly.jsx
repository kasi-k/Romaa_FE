import React, { useEffect, useState } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../../../../components/Title";
import Button from "../../../../../../components/Button";

const ViewWeekly = () => {
  const location = useLocation();
  const rowData = location.state?.item;
  const navigate = useNavigate();


  const [data, setData] = useState({});

useEffect(() => {
  if (rowData?.details?.length > 0) {
    const sectionName = rowData.description;

    const formattedData = {
      [sectionName]: rowData.details.map((detail) => [
        { label: "Contractor", value: detail.contractor, key: "contractor" },
        { label: "Quantity", value: detail.quantity, key: "quantity" },
        { label: "Unit", value: detail.unit, key: "unit" },
        { label: "Man Power", value: detail.manPower, key: "manPower" },
        { label: "Start Date", value: detail.startDate, key: "startDate" },
        { label: "Days Remaining", value: detail.daysRemaining, key: "daysRemaining" },
        // { label: "Status", value: capitalizeFirstLetter(detail.status), key: "status" },
      ]),
    };

    setData(formattedData);
  }
}, [rowData]);


  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const renderField = (field) => {
    if (field.key === "status") {
      return (
        <p className={`text-xs ${statusColorMap[field.value] || ""}`}>
          {field.value}
        </p>
      );
    }
    return <p className="text-xs opacity-50">{field.value}</p>;
  };

  const statusColorMap = {
    Planned: "text-orange-500 font-semibold",
    Ongoing: "text-blue-600 font-semibold",
    Completed: "text-green-600 font-semibold",
  };

  return (
    <>
      <div className="h-full">
        <div className="h-1/12">
          <Title
            title="Projects Management"
            sub_title="Daily  Project"
            active_title={"Daily Project"}
          />
        </div>
        <div className="overflow-auto h-11/12 no-scrollbar">
          <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-6">
            <p className="flex justify-center text-xl font-semibold">
              Daily Project
            </p>
            {Object.entries(data).map(([sectionName, fieldGroups]) =>
              fieldGroups.map((fields, index) => (
                <div key={`${sectionName}-${index}`} className="mb-4">
                  <p className="font-bold col-span-12">{sectionName}</p>

                  <div className="grid grid-cols-12 gap-2 items-start mb-4">
                    {fields.map((field) => (
                      <React.Fragment key={field.key}>
                        <p className="col-span-4 font-medium">{field.label}</p>
                        <div className="col-span-8">{renderField(field)}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end py-2">
            <Button
              onClick={() => navigate(-1)}
              button_name="Back"
              button_icon={<IoChevronBackSharp />}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewWeekly;