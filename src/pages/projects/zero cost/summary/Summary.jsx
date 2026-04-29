import SummaryTable from "./SummaryTable";

const Summary = () => {
  return (
    <>
      <div className="grid">
        <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold">Zero Cost Estimate-Summary</p>
          <div className="grid grid-cols-12 gap-1 items-center">
            <p className="col-span-4 font-medium">Project</p>
            <p className="col-span-8 text-xs opacity-50">
              Rehabilitation of drainage inlets in Kannanar drain and Jeepable
              track from LS. 31.00 Km to 33.00 Km in Right Bank of Kannanar
              drain in Keelakurichi, Periyakkottai and Puliyakudi Villages of
              Pattukkottai Taluk in Thanjavur District
            </p>
            <p className="col-span-4 font-medium">Client</p>
            <p className="col-span-8 text-xs opacity-50">WRO</p>
            <p className="col-span-4 font-medium">Location</p>
            <p className="col-span-8 text-xs opacity-50">
              Pattukkottai Taluk in Thanjavur District
            </p>
            <p className="col-span-4 font-medium">
              Contractual Completion Duration
            </p>
            <p className="col-span-8 text-xs opacity-50">12 months</p>
            <p className="col-span-4 font-medium">
             Considered Completion Duration
            </p>
            <p className="col-span-8 text-xs opacity-50">05 months</p>
          </div>
        </div>
        <div>
            <SummaryTable/>
        </div>
      </div>
    </>
  );
};

export default Summary;
