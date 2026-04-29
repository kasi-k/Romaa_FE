import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { ClientBillingData } from "../../../components/Data";

const clientbillingColumns = [
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "projectValue", label: "Project Value" },
  { key: "paymentCollected", label: "Payment Collected" },
  { key: "billed", label: "Billed" },
  { key: "toBeBilled", label: "To be Billed" },
];



const ClientBilling_Report = () => {
  return (
    <div className="font-roboto-flex flex flex-col">
      <Table
        title="Reports"
        subtitle="Client Billing"
        pagetitle="Client Billing"
        endpoint={ClientBillingData}
        columns={clientbillingColumns}
        ViewModal={true}
        routepoint={"/reports/clientbilling/viewclientbilling"}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        addButtonLabel={null}
        addButtonIcon={null}
      />
    </div>
  );
};

export default ClientBilling_Report;
