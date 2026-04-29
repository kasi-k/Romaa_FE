import { TableReportSiteData } from "../../../../components/Data";
import Table from "../../../../components/Table";
export const column = [
  { label: "Site", key: "Site" },
  { label: "Location", key: "Location" },
  { label: "Planned Date", key: "PlannedDate" },
  { label: "Achieved Date", key: "AchievedDate" },
  { label: "Assigned to", key: "AssignedTo" },
  { label: "Status", key: "Status" },
];

const TableReportSite = () => {
  return (
    <Table
      exportModal={false}
      columns={column}
      endpoint={TableReportSiteData}
      contentMarginTop="mt-0"
      ViewModal={true}
      EditModal={true}
    />
  );
};

export default TableReportSite;
