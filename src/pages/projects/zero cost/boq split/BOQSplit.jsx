import { BOQSplitData } from "../../../../components/Data";
import Table from "../../../../components/Table";

const Columns = [
  { label: "Item Description", key: "itemdesc" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate" },
  { label: "Amount", key: "amount" },
  { label: "Materials", key: "materials" },
  { label: "Machinery", key: "machinery" },
{
  label: "Fuel",
  key: "fuel",
  render: (item) =>
    item.fuel !== undefined && item.fuel !== null && item.fuel !== ""
      ? <span>₹{item.fuel}</span>
      : <span>-</span>,
},
];

const BOQSplit = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={BOQSplitData}
      columns={Columns}
      exportModal={false}
    />
  );
};

export default BOQSplit;
