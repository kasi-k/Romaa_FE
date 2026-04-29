import { Pencil } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";

const ViewP_L = () => {
  const { state } = useLocation();
  const projects = state?.item || {};
  const navigate = useNavigate();

  console.log(projects);

  if (!projects) {
    return <div className="p-4 text-red-600">No project data found.</div>;
  }

  return (
    <>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title
          title="Report"
          sub_title="Finance Report"
          active_title="P&L"
          page_title="P&L"
        />
        <ButtonBg
          button_name="Back"
          onClick={() => navigate(-1)}
        />
      </div>

      <div className="dark:bg-layout-dark bg-white w-full  mx-auto rounded-md px-6 py-6">
        <p className="text-center font-bold text-xl px-2">P&L</p>

        <p className="font-bold ">ROMAA INFRAA PVT LTD</p>
        {[
          { label: "Projects", value: "Name" },
          { label: "Department", value: "Department" },
          { label: "Work Commencement Date", value: "02.05.2025 " },
          { label: "Expected Date of Completion", value: "TNCSC" },
          { label: "Days Remaining", value: "TNCSC" },
          { label: "Agg Value Excluding GST18%", value: "TNCSC" },
        ].map((items, index) => (
          <div key={index} className="grid grid-cols-2 text-sm gap-y-2 py-1">
            <p className="font-semibold dark:text-gray-200 text-gray-800">{items.label}</p>
            <p className="text-gray-600 dark:text-gray-500 font-medium">{items.value}</p>
          </div>
        ))}
        <p className="font-bold mt-4">P&L AND FINACIAL STATUS as on 25.03.25</p>
        {[
          { label: "Upto Date Bill Received", value: "₹1569489" },
          { label: "Balance Value of Work", value: "₹1569489" },
          { label: "Expected Savings", value: "₹42796808" },
          { label: "Total Expense upto Date", value: "₹1569489" },
          { label: "Planned Balance Work Expense", value: "₹1569489" },
          { label: "P/L as on date", value: "₹1569489" },
          { label: "P/L % as on date", value: "₹1569489" },
          { label: "P/L as on completion stage", value: "₹1569489" },
          { label: "P/L % completion stage", value: "₹1569489" },
        ].map((item, index) => {
          let valueClass = "font-medium text-gray-600";

          if (item.label === "P/L % as on date") {
            valueClass = "text-red-600";
          } else if (
            item.label === "P/L as on completion stage" ||
            item.label === "P/L % completion stage"
          ) {
            valueClass = "text-green-600";
          }

          return (
            <div key={index} className="grid grid-cols-2 text-sm gap-y-2 py-1">
              <p className="font-semibold dark:text-gray-200 text-gray-800">{item.label}</p>
              <p className={valueClass}>{item.value}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ViewP_L;
