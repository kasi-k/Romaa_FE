import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { GSTData } from "../../../components/Data";

const GST_PLColumns = [
  { label: "Profit", key: "project" },
  { label: "Project Value", key: "projectValue" },
  { label: "GST Collector", key: "gstCollector" },
  { label: "GST Paid", key: "gstPaid" },
  { label: "GST Profit", key: "gstProfit" },
];

const GST_PL = () => {
  return (
    <Table
      title="Finance"
      subtitle="GST P&L"
      pagetitle="GST P&L"
      endpoint={GSTData}
      columns={GST_PLColumns}
      FilterModal={Filters}
    />
  );
};

export default GST_PL;
