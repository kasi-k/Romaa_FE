import { materialData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const Columns = [
  { label: "Item Description", key: "itemdesc" },
  { label: "Unit", key: "unit" },
  { label: "Quantity", key: "quantity" },
  { label: "Rate/Unit", key: "rate" },
  {
    label: "Rate IncTax",
    key: "rateinctax",
  },
  { label: "Total Amount", key: "totalamnt" },
  { label: "Total Material %", key: "totalmaterial" },
];

const Materials = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      endpoint={materialData}
      columns={Columns}
    />
  );
};

export default Materials;
