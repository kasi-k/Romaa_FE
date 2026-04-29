import React, { useEffect, useState } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../../../components/Button";
import { API } from "../../../../../constant";
import axios from "axios";
import Loader from "../../../../../components/Loader";

const WorkOrderOverviewDetails = [
  { label: "Work order ID", value: "WO-2025-001" },
  { label: "Work order date", value: "2025-05-10" },
  { label: "Client name", value: "ABC Infrastructure Ltd." },
  { label: "Project name", value: "Downtown Commercial Complex" },
  { label: "Agreement no", value: "AG-2025-045" },
  { label: "Agreement date", value: "2025-04-25" },
  { label: "Address of authority", value: "123 Main St, New York, NY 10001" },
  { label: "Awarding authority", value: "Mr. John Doe" },
  { label: "Project Duration(in Months)", value: "18" },
  { label: "Date of actual commencement", value: "2025-05-15" },
  { label: "Stipulated date of completion", value: "2026-11-15" },
  { label: "Agreement type", value: "Lump Sum" },
  { label: "Work order amount", value: "2,500,000" },
];

const WorkOrderOverview = () => {
  const navigate = useNavigate();
  const { tender_id } = useParams();

  const [tenderDetailsState, setTenderDetailsState] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenderOverview = async () => {
    try {
      const res = await axios.get(
        `${API}/tender/getoverviewworkorder/${tender_id}`
      );
      const data = res.data.data;

      setTenderDetailsState([
        { label: "Work order ID", value: data.workOrderDetails?.workOrder_id },
        {
          label: "Work order date",
          value: new Date(data.workOrderDetails?.workOrder_issued_date).toLocaleDateString("en-GB"),
        },
        { label: "Client name", value: data.workOrderDetails?.client_name },
        { label: "Project name", value: data.workOrderDetails?.tender_name },
        {label:"Tender Type", value: data.workOrderDetails?.tender_type},
        // { label: "Agreement no", value: "AG-2025-045" },
        // { label: "Agreement date", value: "2025-04-25" },
         {
          label: "Project Location",
          value: `${data.workOrderDetails?.project_location?.city || ""}, ${
            data.workOrderDetails?.project_location?.state || ""
          }`,
        },
        // { label: "Awarding authority", value: "Mr. John Doe" },
        {
          label: "Project Duration(in Months)",
          value: data.workOrderDetails?.tender_duration,
        },
        {
          label: "Date of actual commencement",
          value: new Date(data.workOrderDetails?.tender_published_date).toLocaleDateString("en-GB"),
        },
       // { label: "Stipulated date of completion", value: "2026-11-15" },
        // { label: "Agreement type", value: data.workOrderDetails?.agreement_type },
        { label: "Work order amount", value: data.workOrderDetails?.tender_value },
       
      ]);
    } catch (err) {
      console.error("Error fetching overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tender_id) fetchTenderOverview();
  }, [tender_id]);

  if (loading) return <Loader fullScreen={false} />;

  return (
    <>
      <div className="h-full">
        <div className="w-fit h-fit dark:bg-layout-dark bg-white rounded-lg shadow p-4">
          <p className="font-semibold text-lg">General</p>
          <div className="grid grid-cols-12 gap-2  text-xs font-semibold  py-2 ">
            {tenderDetailsState.map((item, index) => (
              <React.Fragment key={index}>
                <p className="col-span-6">{item.label}</p>
                <p className="col-span-6 text-end opacity-60 font-extralight">
                  {item.label === "Work order amount"
                    ? `₹${item.value}`
                    : item.value}
                </p>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex justify-end py-2 ">
          <Button
            onClick={() => navigate("..")}
            button_name="Back"
            button_icon={<IoChevronBackSharp />}
          />
        </div>
      </div>
    </>
  );
};

export default WorkOrderOverview;
