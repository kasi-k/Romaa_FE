import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { workanalysisData } from "../../../components/Data";
import ViewWorkAnalysis from "./ViewWorkAnalysis";

const worrkanalysisColumns = [
  { key: "project", label: "Project" },
  { key: "location", label: "Location" },
  { key: "startDate", label: "Start Date" },
  { key: "status", label: "Status" },
  { key: "pending", label: "Pending" },
  { key: "projectManager", label: "Project Manager" },
];


const WorkAnalysis = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        title="Reports"
        subtitle="Work Analysis"
        pagetitle="Work Analysis"
        endpoint={workanalysisData}
        columns={worrkanalysisColumns}
        ViewModal={true}
        routepoint={"/reports/workanalysis/viewworkanalysis"}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default WorkAnalysis;
