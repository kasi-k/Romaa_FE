import Filters from "../../../../components/Filters";
import { OverallProjectData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const projectColumn = [
  { key: "projectName", label: "Project Name" },
  { key: "expenses", label: "Expenses" },
  { key: "tax", label: "Tax" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" }
];



const Project = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
      exportModal={false}
        endpoint={OverallProjectData}
        columns={projectColumn}
        onExport={() => console.log("Exporting...")}
      />
    </div>
  );
};

export default Project;
