import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { costtocompleteData } from "../../../components/Data";

export const costtocompleteColumns = [
  { key: "projectName", label: "Project Name" },
  { key: "projectCompletion", label: "Project Completion" },
  { key: "pendingWork", label: "Pending work" },
  { key: "costToComplete", label: "Cost to complete" },
];


const CosttoComplete = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        title="Reports"
        subtitle="Cost to Complete"
        pagetitle="Cost to Complete"
        endpoint={costtocompleteData}
        columns={costtocompleteColumns}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default CosttoComplete;