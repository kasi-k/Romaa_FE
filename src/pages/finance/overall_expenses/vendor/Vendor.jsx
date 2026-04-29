import Filters from "../../../../components/Filters";
import { vendoroverallData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const vendorcolumn =  [
  { key: "projectName", label: "Project Name" },
  { key: "vendorName", label: "Vendor Name" },
  { key: "expenses", label: "Expenses" },
  { key: "tax", label: "Tax" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" }
];

const Vendor = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
      exportModal={false}
        endpoint={vendoroverallData}
        columns={vendorcolumn}
        onExport={() => console.log("Exporting...")}
      
      />
    </div>
  );
};

export default Vendor;
