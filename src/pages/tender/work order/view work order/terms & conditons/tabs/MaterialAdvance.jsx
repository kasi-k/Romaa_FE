import { MaterialAdvanceData } from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";

const MaterailAdvancecolumns = [
  { label: "Material name", key: "materialname" },
  { label: "Percentage", key: "percnetage" },
];

const MaterialAdvance = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      endpoint={MaterialAdvanceData}
      columns={MaterailAdvancecolumns}
    />
  );
};

export default MaterialAdvance;
