import React, { use } from "react";
import Modal from "../../../../../components/Modal";
import { useNavigate } from "react-router-dom";

const BOQ_FIELDS = [
  { label: "Ref no", key: "item_code" },
  { label: "Material", key: "item_name" },
  { label: "Unit", key: "unit" },
  { label: "Quantity", key: "quantity" },
  { label: "Base Rate", key: "zero_cost_unit_rate" },
  // { label: "Quoted Rate", key: "quotedrate", isRupee: true },
  // { label: "WO Rate", key: "worate", isRupee: true },
  { label: "Amount", key: "zero_cost_final_amount", isRupee: true },
  {label:"Remarks",key:"remarks"},
  { label: "Specification", key: "description" },
];

const ViewWorkOrderBoq = ({ onclose, item }) => {

  const navigate = useNavigate();
  const data = item || {
    refno: "#2345",
    unit: "33ABCDE4567F8Z9",
    quantity: 80,
    baserate: 728.57,
    quotedrate: 5678,
    worate: 5678,
    amount: 5678,
    specification: "Earthwork excavation for foundation",
  };

  return (
    <Modal
      title="Zero Cost BOQ Item Details"
      widthClassName="lg:w-[420px] md:w-[400px] w-96"
      onclose={onclose}
      child={
        <form className="grid grid-cols-12 gap-4 px-8 py-8 text-sm">
          {BOQ_FIELDS.map((field) => (
            <React.Fragment key={field.key}>
              <label className="font-semibold col-span-7">{field.label}</label>
              <p className="text-sm font-light col-span-5">
                {field.isRupee ? `₹${data[field.key]}` : data[field.key]}
              </p>
            </React.Fragment>
          ))}
          <div className="col-span-12 flex justify-end items-center gap-2 mt-4 text-sm font-extralight">
            <p
              className="cursor-pointer border dark:text-white dark:border-white border-black px-6 py-1.5 rounded-sm"
              onClick={onclose}
            >
              Cancel
            </p>
            <p
            onClick={()=>navigate("viewworkordertable")}
              className="cursor-pointer bg-darkest-blue text-white px-6 py-1.5 rounded-sm"
           
            >
              View
            </p>
          </div>
        </form>
      }
    />
  );
};

export default ViewWorkOrderBoq;