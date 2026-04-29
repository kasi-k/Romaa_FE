import { DepositworkorderData } from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";


const DepositColumns = [
  { label: "Deposit Type", key: "deposit" },
  { label: "Mode", key: "mode" },
  { label: "Ref no", key: "refno" },
  { label: "Amount", key: "amount" },
  { label: "Valid upto", key: "validupto" },

];

const Deposit = () => {
  return <Table contentMarginTop="mt-0" exportModal={false} endpoint={DepositworkorderData} columns={DepositColumns} />;
};

export default Deposit;
