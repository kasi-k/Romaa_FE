import Filters from "../../../../components/Filters";
import { vendorData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const vendorcolumn = [
  { key: "projectName", label: "Project Name" },
  { key: "vendorName", label: "Vendor Name" },
  { key: "expenses", label: "Expenses" },
  { key: "tax", label: "Tax" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
];

const Vendor = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
        ExportModal={false}
        endpoint={vendorData}
        columns={vendorcolumn}
        ViewModal={true}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
        exportModal={false}
      />
    </div>
  );
};

export default Vendor;
