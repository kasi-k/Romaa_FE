
import { TechnicalSpecificationsData } from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";

const Technicalspecificationscolumns = [
  { label: "Title", key: "title" },
  { label: "Specifications", key: "specifications" },
];

const TechnicalSpecifications = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      endpoint={TechnicalSpecificationsData}
      columns={Technicalspecificationscolumns}
    />
  );
};

export default TechnicalSpecifications;
