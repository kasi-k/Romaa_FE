import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { actualvsbilledData } from "../../../components/Data";

export const actualvsbilledColumns = [
  { key: "project", label: "Project" },
  { key: "actualValue", label: "Actual value" },
  { key: "billedValue", label: "Billed Value" },
  { key: "toBeBilled", label: "To Be Billed" },
];

const ActualvsBilled = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        title="Reports"
        subtitle="Actual vs Billed"
        pagetitle="Actual Vs Billed"
        endpoint={actualvsbilledData}
        columns={actualvsbilledColumns}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default ActualvsBilled;
