import { CreditDebitData } from "../../../../../components/Data";
import Table from "../../../../../components/Table";

const CreditDebitColumns = [
  { label: "Date", key: "date" },
  { label: "Invoice no", key: "invoiceno" },
  { label: "Particle", key: "particle" },
  { label: "Actual Quantity ", key: "actualquantity" },
  { label: "Received Quantity", key: "receivedquantity" },
  {
    label: "Actual Amount",
    key: "actualamount",
    render: (item) => `₹${Number(item.actualamount).toLocaleString("en-IN")}`,
  },
  {
    label: "Variance",
    key: "variance",
    render: (item) => (
      <span className={item.variance < 0 ? "text-red-600" : ""}>
        ₹{Number(item.variance).toLocaleString("en-IN")}
      </span>
    ),
  },
  { label: "Credit/Debit", key: "creditdebit" },
];

const CreditDebit = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={CreditDebitData}
      columns={CreditDebitColumns}
      exportModal={false}
    />
  );
};

export default CreditDebit;
