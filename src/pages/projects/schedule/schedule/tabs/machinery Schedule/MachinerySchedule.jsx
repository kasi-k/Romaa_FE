import Table from "../../../../../../components/Table";
import { MechanicalScheduleData } from "../../../../../../components/Data";

const Columns = [
  { label: "S.no", key: "sno" },
  { label: "Machine Name", key: "machineName" },
  { label: "Assigned Site", key: "assignedSite" },
  { label: "Start Date", key: "startDate" },
  { label: "Working Hours", key: "workingHours" },
  { label: "Status", key: "status" },
];

const MachinerySchedule = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={MechanicalScheduleData}
      columns={Columns}
      routepoint={"viewmechineryschedule"}
      exportModal={false}
    />
  );
};

export default MachinerySchedule;
