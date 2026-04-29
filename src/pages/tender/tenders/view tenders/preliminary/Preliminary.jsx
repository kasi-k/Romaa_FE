import { VendorData } from "../../../../../components/Data";
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";

const customerColumns = [
  { label: "Vendor ID", key: "vendorid" },
  { label: "Vendor Name", key: "vendorname" },
  { label: "Vendor Type", key: "vendor" },
  { label: "Address", key: "address" },
  { label: "GSTIN", key: "gstin" },
];

const Preliminary = () => {
  return (
    <>
      <Table
        contentMarginTop="mt-0"
        endpoint={VendorData}
        columns={customerColumns}
        ViewModal={true}
        exportModal={false}
        DeleteModal={DeleteModal}
        deletetitle="preliminary"
      />
    </>
  );
};

export default Preliminary;
