import { vendorProjectData } from "../../../../components/Data";
import StarProgress from "../../../../components/StarProgress";
import Table from "../../../../components/Table";

const ContractorColumns = [
  { label: "Vendor Name", key: "vendorname" },
  { label: "Category ", key: "category" },
  { label: "Contact Person", key: "contactperson" },
  { label: "Phone Number", key: "phonenumber" },
  {
    label: "Rating",
    key: "rating",
    render: (row) => <StarProgress rating={row.rating} />,
  },
];

const VendorSite = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={vendorProjectData}
      columns={ContractorColumns}
      routepoint={"viewvendorsite"}
      exportModal={false}
    />
  );
};

export default VendorSite;
