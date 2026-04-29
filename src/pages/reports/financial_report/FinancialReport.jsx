import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { financialreportData } from "../../../components/Data";

const financialreportColumns = [
  { key: "project", label: "Projects" },
  { key: "workType", label: "Work Type" },
  { key: "projectValue", label: "Project Value" },
  { key: "completedValue", label: "Completed Value" },
  { key: "currentProfit", label: "Current Profit" },
  { key: "predictedProfit", label: "Predicted Profit" },
];




const FinancialReport = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        title="Dashboard"
        subtitle="Financial Report"
        pagetitle="Financial Report"
        endpoint={financialreportData}
        columns={financialreportColumns}
        ViewModal={true}
        routepoint={"/reports/financialreport/viewfinancialreport"}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default FinancialReport;
