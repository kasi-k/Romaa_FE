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

const BulkMateialSite = () => {
  return (
  
      <Table
        contentMarginTop="mt-0"
        endpoint={bulkmaterialData}
        columns={bulkmaterialcolumn}
        exportModal={false}
      />
   
  );
};

export default BulkMateialSite;
