import React, { useEffect, useState } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../../../../components/Title";
import Button from "../../../../../../components/Button";

const ViewManPowerHistogram = () => {
  const location = useLocation();
  const rowData = location.state?.item;
  const navigate = useNavigate();

  const [data, setData] = useState({});

  useEffect(() => {
    if (rowData?.details?.length > 0) {
      const sectionName = rowData.description;
      console.log(rowData);

      const formattedData = {
        [sectionName]: rowData.details.map((detail) => [
          {
            label: "Description",
            value: detail.contractor,
            key: "description",
          },
          { label: "Quantity", value: detail.quantity, key: "quantity" },
          { label: "Unit", value: detail.unit, key: "unit" },
          { label: "Start Date", value: detail.startDate, key: "startDate" },
          {
            label: "Days Remaining",
            value: detail.daysRemaining,
            key: "daysRemaining",
          },
          { label: "No of man Power", value: detail.manPower, key: "manPower" },
        ]),
      };

      setData(formattedData);
    }
  }, [rowData]);

  return (
    <>
      <div className="h-full">
        <div className="h-1/12">
          <Title
            title="Projects Management"
            sub_title="Man Power Histogram"
            active_title={"Man Power Histogram"}
          />
        </div>
        <div className="overflow-auto h-11/12 no-scrollbar">
          <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-6">
            <p className="flex justify-center text-xl font-semibold">
              Man Power Histogram
            </p>
            {Object.entries(data).map(([sectionName, fieldGroups]) => (
              <div key={sectionName} className="mb-6 ">
                <p className="font-bold text-lg mb-3">{sectionName}</p>

                {fieldGroups.map((fields, index) => (
                  <div
                    key={`${sectionName}-${index}`}
                    className="grid grid-cols-12 gap-2 my-7 items-start mb-4"
                  >
                    {fields.map((field) => (
                      <React.Fragment key={field.key}>
                        <p className="col-span-4 font-medium">{field.label}</p>
                        <p className="col-span-8 text-gray-400 font-normal">
                          {field.value}
                        </p>
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            ))}
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

export default ViewManPowerHistogram;
