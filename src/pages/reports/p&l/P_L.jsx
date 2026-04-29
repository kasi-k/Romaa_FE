import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { p_lData } from "../../../components/Data";

const p_lColumns =  [
  { key: "project", label: "Projects" },
  { key: "location", label: "Location" },
  { key: "totalValue", label: "Total Value" },
  { key: "totalExpenses", label: "Total Expenses" },
  { key: "totalProfit", label: "Total Profit" },
  { key: "profitPercentage", label: "Profit Percentage" },
];



const P_L = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        title="Reports"
        subtitle="P&L"
        pagetitle="P&L"
        endpoint={p_lData}
        columns={p_lColumns}
        ViewModal={true}
        routepoint={`/reports/p&l/viewp&l`}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default P_L;
