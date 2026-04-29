import Filters from "../../../../components/Filters";
import { outflowData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const outflowcolumn = [
  { key: "projectName", label: "Project Name" },
  { key: "materialExpenses", label: "Material Expenses" },
  { key: "otherExpenses", label: "Other Expenses" },
  { key: "forecastExpenses", label: "Forecast Expenses" },
];

const OutFlow = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
        ExportModal={false}
        endpoint={outflowData}
        columns={outflowcolumn}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
        exportModal={false}
      />
    </div>
  );
};

export default OutFlow;
