import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { machineproductivityData } from "../../../components/Data";

const machineproductivityColumns =  [
  { key: "machineName", label: "Machine Name" },
  { key: "project", label: "Project" },
  { key: "plannedHours", label: "Planned Hours" },
  { key: "actualHours", label: "Actual Hours" },
  { key: "utilization", label: "Utilization %" }
];


const MachineProductivity = () => {
  return (
    <div className="font-roboto-flex flex flex-col">
      <Table
        title="Reports"
        subtitle="Machine Productivity"
        pagetitle="Machine Productivity"
        endpoint={machineproductivityData}
        columns={machineproductivityColumns}
        exportModal={false}
      />
    </div>
  );
};

export default MachineProductivity;
