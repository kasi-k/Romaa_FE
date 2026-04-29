import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { vendorreportData } from "../../../components/Data";
import StarProgress from "../../../components/StarProgress";

const vendorreportColumns =  [
  { key: "vendorName", label: "Vendor name" },
  { key: "category", label: "Category" },
  { 
    key: "ratings", 
    label: "Rating", 
    render: (item) => <StarProgress rating={item.ratings} /> 
  },
  { key: "totalBilled", label: "Total Billed" },
  { key: "outstandingPayments", label: "Outstanding Payments" },
];




const VendorReport = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        title="Reports"
        subtitle="Vendor Report"
        pagetitle="Vendor Report"
        endpoint={vendorreportData}
        columns={vendorreportColumns}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default VendorReport;
