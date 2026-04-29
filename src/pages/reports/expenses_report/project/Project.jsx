import Filters from "../../../../components/Filters";
import { projectData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const projectcolumn = [
  { key: "projectName", label: "Project Name" },
  { key: "expenses", label: "Expenses" },
  { key: "tax", label: "Tax" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
];



const Project = () => {
  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <Table
        ExportModal={false}
        endpoint={projectData}
        columns={projectcolumn}  
        ViewModal={true}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
           exportModal={false}
      />
    </div>
  );
};

export default Project;
