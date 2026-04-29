import Filters from "../../../../components/Filters";
import { bulkmaterialData } from "../../../../components/Data";
import Table from "../../../../components/Table";

export const bulkmaterialcolumn = [
  { key: "particle", label: "Particle" },
  { key: "stockReceived", label: "Stock Received at site" },
  { key: "stockSent", label: "Stock Sent to other Site" },
  { key: "stockAtSite", label: "Stock at Site" },
  { key: "actualConsumption", label: "Actual Consumption" },
  { key: "theoreticalConsumption", label: "Theoretical Consumption" },
  { key: "quantity", label: "Quantity" },
  { key: "percentage", label: "Percentage" },
];

const BulkMateial = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
        ExportModal={false}
        endpoint={bulkmaterialData}
        columns={bulkmaterialcolumn}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
        exportModal={false}
      />
    </div>
  );
};

export default BulkMateial;
