import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { ticketsData } from "../../../components/Data";
import { HiOutlineTicket } from "react-icons/hi";
import RaiseTickets from "./RaiseTickts";

const ticketsColumns = [
  { key: "name", label: "Name" },
  { key: "date", label: "Date" },
  { key: "location", label: "Location" },
  { key: "description", label: "Description" },
  {
    key: "status",
    label: "Status",
    render: (item) => {
      let base = "font-semibold text-sm px-2 py-1 rounded";
      let status = item.status?.toLowerCase();

      if (status === "completed") {
        return <span className={`${base} text-green-600`}>Completed</span>;
      } else if (status === "progress") {
        return <span className={`${base} text-yellow-400`}>Progress</span>;
      } else {
        return <span className={`${base} text-red-600 `}>Not Completed</span>;
      }
    },
  },
];

const Tickets = () => {
  return (
    <div className="font-roboto-flex flex flex-col ">
      <Table
        title="Dashboard "
        subtitle="Main dashboard"
        pagetitle="Tickets"
        active_title="Tickets"
        endpoint={ticketsData}
        columns={ticketsColumns}
        ViewModal={true}
        EditModal={true}
        routepoint={""}
        FilterModal={Filters}
        onExport={() => console.log("Exporting...")}
        AddModal={RaiseTickets}
        addButtonLabel="Raise Tickets"
        addButtonIcon={<HiOutlineTicket size={22}/>}
      />
    </div>
  );
};

export default Tickets;
