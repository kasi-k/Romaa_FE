import Filters from "../../../../components/Filters";
import { WPI } from "../../../../components/Data";
import Table from "../../../../components/Table";

const WPIColumns = [
  { label: "Project", key: "project" },
  { label: "Location", key: "location" },
  { label: "Start Date", key: "startDate" },
  { label: "End Date", key: "endDate" },
  { label: "Amount", key: "amount" },
  { label: "Status", key: "status" },
];

const WorkProgressIndicator = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        ExportModal={false}
        endpoint={WPI}
        columns={WPIColumns}
        ViewModal={true}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
        exportModal={false}
      />
    </div>
  );
};

export default WorkProgressIndicator;
