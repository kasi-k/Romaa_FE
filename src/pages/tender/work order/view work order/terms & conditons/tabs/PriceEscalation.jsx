import { PriceEscalationData } from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";



const PriceEscalationcolumns = [
  { label: "Material name", key: "materialname" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate" },
];

const PriceEscalation = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      endpoint={PriceEscalationData}
      columns={PriceEscalationcolumns}
    />
  );
};

export default PriceEscalation;
