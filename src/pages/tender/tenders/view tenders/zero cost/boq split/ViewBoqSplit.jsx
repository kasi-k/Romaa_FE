import React from "react";
import { IoClose } from "react-icons/io5";

const fields = [
  { label: "Category", key: "category" },
  { label: "Work Section", key: "work_section" },
  { label: "Description", key: "description" },
  { label: "Specification", key: "specification" },
  { label: "Remarks", key: "remarks" },
  { label: "Unit", key: "unit" },
  { label: "Quantity", key: "quantity" },
  { label: "Final Unit Rate", key: "final_unit_rate", prefix: "₹ " },
  { label: "Final Amount", key: "final_amount", prefix: "₹ " },
  { label: "Zero Cost Unit Rate", key: "zero_cost_unit_rate", prefix: "₹ " },
  {
    label: "Zero Cost Final Amount",
    key: "zero_cost_final_amount",
    prefix: "₹ ",
  },
  { label: "Material", key: "material_amount", prefix: "₹ " },
  { label: "Machinery", key: "machinery_amount", prefix: "₹ " },
  { label: "Labour", key: "labor_amount", prefix: "₹ " },
  { label: "Fuel", key: "fuel_amount", prefix: "₹ " },
  { label: "Subcontractor", key: "subcontractor_amount", prefix: "₹ " },
];

const ViewBoqSplit = ({ onclose, item }) => {
  if (!item) return null;

  return (
    <div className="font-roboto-flex fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/30 z-50">
      <div className=" bg-white dark:bg-overall_bg-dark rounded-lg shadow-lg w-full max-w-lg ">
        {/* Close button */}
        <p
          onClick={onclose}
          className="grid place-self-end cursor-pointer -mx-4 -my-4  dark:bg-overall_bg-dark bg-white shadow-sm py-2.5 px-2.5 rounded-full"
        >
          <IoClose size={24} />
        </p>

        {/* Grid for all fields */}
        <div className="grid grid-cols-12 justify-center items-center gap-3 text-sm px-8 py-6 ">
          {/* Header */}
          <p className="col-span-12 text-center text-xl font-semibold dark:text-white text-darkest-blue pb-6">
            {item.item_name} ({item.item_code})
          </p>
          {fields.map((field) => {
            const value = item[field.key];
            return (
              <React.Fragment key={field.key}>
                <label className="font-semibold col-span-7 ">
                  {field.label}
                </label>
                <p className="text-sm font-light col-span-5 ">
                  {value !== undefined && value !== ""
                    ? `${field.prefix || ""}${value}`
                    : "-"}
                </p>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewBoqSplit;
