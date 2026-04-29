import { EMDdata } from "../../../components/Data";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";

const Columns = [
  { label: "Tender ID", key: "id" },
  { label: "Project Name", key: "pName" },
  { label: "Deposit", key: "deposit" },
  { label: "EMP", key: "emp" },
  { label: "Expiry Date", key: "expdate" },
  { label: "Amount Collected", key: "amountcollected" },
  { label: "Balance", key: "balance" },
  { label: "Note", key: "note" },
];

const DLP = () => {
  return (
    <Table
      title="Tender Management"
      subtitle="DLP"
      // loading ={true}
      pagetitle="DLP"
      endpoint={EMDdata}
      columns={Columns}
      FilterModal={Filters}
      onExport={() => console.log("Exporting...")}
    />
  );
};

export default DLP;
