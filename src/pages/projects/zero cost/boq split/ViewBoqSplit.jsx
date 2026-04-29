import React, { useState } from "react";
import Button from "../../../../components/Button";
import Title from "../../../../components/Title";
import { TbPencil } from "react-icons/tb";
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ViewBoqSplit = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Data with tooltip text for fields that have one
  const [mainFields, setMainFields] = useState([
    {
      label: "Item Description",
      value: `Providing and placing Plain Cement Concrete M 10 grade using
crusher broken hard granite course aggregate (well graded) of
nominal maximum size of 40 mm and down graded to I.S specified
grade and mixing the ingredients in approved mixer including
dewatering of the placement site by baling / pumping and diverting
wherever necessary placing in layers and vibrating, water curing,
finishing the surface with all leads and lifts etc., complete in
all respects so as to attain the profile and strengh specified in
the approved drawing and specifications, and including the cost
component of providing rigid and smooth centering and shuttering
and scaffolding wherever necessary for various depth below and
heights above ground level as per the direction of the engineer in
charge of works etc., complete complying with standard
specification and as directed by the departmental officer.`,
      type: "textarea",
      key: "description",
      tooltip: "Detailed description of the work item",
    },
    {
      label: "Quantity",
      value: "203.00",
      type: "number",
      key: "quantity",
      tooltip: "Total quantity measured in units",
    },
    {
      label: "Units",
      value: "M3",
      type: "text",
      key: "units",
      tooltip: "Measurement units",
    },
    {
      label: "Rate",
      value: "₹511.00",
      type: "text",
      key: "rate",
      tooltip: "Rate per unit",
    },
    {
      label: "Amount",
      value: "₹1,03,733.00",
      type: "text",
      key: "amount",
      tooltip: "Total amount (Quantity × Rate)",
    },
  ]);

  const [pccFields, setPccFields] = useState([
    {
      label: "Materials",
      value: "₹140.75",
      key: "materials",
      tooltip: "Cost of materials",
    },
    {
      label: "Machinery",
      value: "₹140.75",
      key: "machinery",
      tooltip: "Machinery costs",
    },
    { label: "Fuel", value: "₹140.75", key: "fuel", tooltip: "Fuel expenses" },
    { label: "S/c", value: "-", key: "sc", tooltip: "S/c details" },
    { label: "Labor", value: "₹40.75", key: "labor", tooltip: "Labor costs" },
    {
      label: "Total Rate",
      value: "₹40.75",
      key: "totalRate",
      tooltip: "Total rate",
    },
    {
      label: "Amount",
      value: "₹40.75",
      key: "amountPCC",
      tooltip: "Total amount",
    },
    {
      label: "Variance",
      value: "₹140.75",
      key: "variance",
      tooltip: "PCC M 10 Machinery * Quantity",
    },
  ]);

  const updateField = (key, newValue, section) => {
    const setter = section === "main" ? setMainFields : setPccFields;
    const data = section === "main" ? mainFields : pccFields;

    setter(
      data.map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      )
    );
  };

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => {
    setIsEditing(false);
    console.log("Saved Main Fields:", mainFields);
    console.log("Saved PCC Fields:", pccFields);
    // API save calls here
  };

  // Tooltip wrapper
  const TooltipWrapper = ({ tooltip, children }) => {
    if (!tooltip) return children;
    return (
      <div className="relative group inline-block cursor-help">
        {children}
        <div className="absolute z-10 hidden group-hover:block bg-indigo-100 text-black text-xs font-semibold px-3 py-1 rounded shadow-md -top-6 left-36 -translate-x-1/2 w-52 whitespace-normal">
          {tooltip}
          <div className="absolute -bottom-1 left-1 w-3.5 h-3 bg-indigo-100 transform rotate-45"></div>
        </div>
      </div>
    );
  };

  const renderField = (field, section) => {
    if (isEditing) {
      if (field.type === "textarea") {
        return (
          <textarea
            className="w-full p-2 border rounded resize-none text-xs"
            rows={6}
            value={field.value}
            onChange={(e) => updateField(field.key, e.target.value, section)}
          />
        );
      }
      return (
        <input
          type={field.type || "text"}
          className="w-full p-1 border rounded text-xs"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value, section)}
        />
      );
    }
    // Not editing: show value + tooltip
    return (
      <TooltipWrapper tooltip={field.tooltip}>
        <p className="text-xs opacity-50">{field.value}</p>
      </TooltipWrapper>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center my-2">
        <Title
          title="Projects Management"
          sub_title="Zero Cost"
          active_title="View BOQ Split"
        />
        {!isEditing ? (
          <Button
            button_name="Edit"
            button_icon={<TbPencil size={23} />}
            onClick={handleEditClick}
          />
        ) : (
          <Button button_name="Save" onClick={handleSaveClick} />
        )}
      </div>

      <div className="bg-white p-4 rounded-lg space-y-2 text-sm">
        <p className="font-semibold text-center text-lg">
          Zero Cost Estimate-BOQ Split
        </p>

        <div className="grid grid-cols-12 gap-2 items-start">
          {mainFields.map((field) => (
            <React.Fragment key={field.key}>
              <p className="col-span-4 font-medium">{field.label}</p>
              <div className="col-span-8">{renderField(field, "main")}</div>
            </React.Fragment>
          ))}

          <p className="font-semibold col-span-12 py-2">PCC M 10</p>

          {pccFields.map((field) => (
            <React.Fragment key={field.key}>
              <p className="col-span-4 font-medium">{field.label}</p>
              <div className="col-span-8">{renderField(field, "pcc")}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex justify-end py-2 ">
      <Button onClick={()=>navigate("..?tab=2")} button_name="Back" button_icon={<IoChevronBackSharp />} />
      </div>
    </div>
  );
};

export default ViewBoqSplit;
