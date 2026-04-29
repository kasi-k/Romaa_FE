import Table from "../../../components/Table";
import { StockProjectData } from "../../../components/Data";
import Filters from "../../../components/Filters";
const Columns = [
  { label: "Materail Name ", key: "materialname" },
  { label: "Unit", key: "unit" },
  { label: "In Stock", key: "instock" },
  { label: "Min Level", key: "minlevel" },
  { label: "Max Level", key: "maxlevel" },
  { label: "Machinery", key: "machinery" },
  {
    label: "Status",
    key: "status",
    render: (item) => (
      <span
        className={`font-medium ${
          item.status === "in stock"
            ? " text-green-600"
            : item.status === "low"
            ? "text-orange-500 "
            : ""
        }`}
      >
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </span>
    ),
  },
];

const PurchaseStocks = () => {
  return (
    <Table
      title={"Purchase Managemnet"}
      subtitle={"Stocks"}
      pagetitle={" Stocks"}
      endpoint={StockProjectData}
      columns={Columns}
      FilterModal={Filters}
    />
  );
};

export default PurchaseStocks;
