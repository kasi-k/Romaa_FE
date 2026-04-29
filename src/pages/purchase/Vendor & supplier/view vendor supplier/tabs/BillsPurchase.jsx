import { BillsPurchasedata } from "../../../../../components/Data";
import Table from "../../../../../components/Table";

const BillsColumns = [
  { label: "Date", key: "date" },
  { label: "Invoice no", key: "invoiceno" },
  { label: "Particle", key: "particle" },
  { label: "Total ", key: "total" },
  { label: "Tax", key: "tax" },
  { label: "Grand Total", key: "grandtotal" },
  { label: "Due Date", key: "duedate" },
  {
    label: "Status",
    key: "status",
    render: (item) => (
      <span
        className={` ${
          item.status === "paid"
            ? " text-green-600"
            : item.status === "unpaid"
            ? "text-red-600"
            : ""
        }`}
      >
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </span>
    ),
  },
];

const BillsPurchase = () => {
  return (
    <Table
    contentMarginTop="mt-0"
      endpoint={BillsPurchasedata}
      columns={BillsColumns}
      exportModal={false}
    />
  );
};

export default BillsPurchase;
