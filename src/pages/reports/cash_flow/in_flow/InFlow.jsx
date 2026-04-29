import Filters from "../../../../components/Filters";
import { inflowData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const inflowcolumn = [
  { key: "project", label: "Projects" },
  { key: "billed", label: "Billed" },
  { key: "toBeBilled", label: "To be Billed" },
  { key: "forecastedValue", label: "Forecasted Value" },
];


const InFlow = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
        ExportModal={false}
        endpoint={inflowData}
        columns={inflowcolumn}  
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
        exportModal={false}
      />
    </div>
  );
};

export default InFlow;
