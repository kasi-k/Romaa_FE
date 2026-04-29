import { collectionprojectionData } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { LuNotebookText } from "react-icons/lu";

const columns = [
  { label: "Project Name", key: "projectName" },
  { label: "Projection Amount", key: "projectionAmount" },
  { label: "First Projection Date", key: "firstProjectionDate" },
  { label: "Projection Date", key: "projectionDate" },
  { label: "Received Amount", key: "receivedAmount" }
];



const CollectionProjection = () => {
  return (
    <Table
      title="Reports"
      subtitle="Collection Projection"
      pagetitle="Collection Projection"
      columns={columns}
      endpoint={collectionprojectionData}
      ViewModal={true}
      routepoint={"/reports/collectionprojection/viewcollectionprojection"}
      FilterModal={Filters}
      addButtonLabel="Add NMR"
      addButtonIcon={<LuNotebookText size={23} />}
    />
  );
};

export default CollectionProjection;