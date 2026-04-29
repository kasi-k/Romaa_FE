import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarProgress from "../../../../../components/StarProgress";
import Button from "../../../../../components/Button";

const vendorFields = [
  { label: "Name", key: "company_name" },
  { label: "Vendor Type", key: "type" },
  { label: "Mobile Number", key: "contact_phone" },
  { label: "Email", key: "contact_email" },
  { label: "Credit Days", key: "credit_day" }, // If exists in data
  { label: "Business Type", key: "businesstype" }, // If exists in data
  { label: "Industry Category", key: "industry_category" }, // If exists in data
  { label: "PAN Number", key: "pan_no" },
  { label: "Street", key: "address.street" },
  { label: "City", key: "address.city" },
  { label: "State", key: "address.state" },
  { label: "Country", key: "address.country" },
  { label: "Pincode", key: "address.pincode" },
];


const getValue = (obj, path) => {
  if (!obj) return null;
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : null), obj);
};

const VendorFullDetails = ({ vendor }) => {
  const navigate = useNavigate();

  if (!vendor) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No vendor data available</p>
        <Button
          button_name="Back"
          button_icon={<ChevronLeft />}
          onClick={() => navigate("..")}
        />
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        <div className="dark:bg-layout-dark bg-white w-full gap-y-2 rounded-md px-6 py-6">
          <p className="text-xl text-center font-semibold pb-4">
            Vendor Details
          </p>

          <div className="flex flex-col col-span-2 sm:grid grid-cols-7 w-full space-y-2">
            {vendorFields.map((field) => (
              <React.Fragment key={field.key}>
                <p className="text-sm col-span-3 font-bold dark:text-gray-200 text-gray-800">
                  {field.label}
                </p>
                <p className="text-sm col-span-2 dark:text-gray-400 text-gray-600">
                  {getValue(vendor, field.key) || "-"}
                </p>
              </React.Fragment>
            ))}

            <p className="text-sm col-span-3 font-bold dark:text-gray-200 text-gray-800">
              Ratings
            </p>
            <div className="text-sm col-span-2 dark:text-gray-400 text-gray-600 flex items-center">
              <StarProgress rating={vendor?.rating} />
              <span className="ml-2">{vendor?.rating ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-4 flex justify-end">
        <Button
          button_name="Back"
          button_icon={<ChevronLeft />}
          onClick={() => navigate("..")}
        />
      </div>
    </>
  );
};

export default VendorFullDetails;
