

const SummaryCard = ({ title, value, status,icon }) => (
  <div className="dark:bg-layout-dark bg-white  rounded-xl p-4  w-full">
    <div className="border-l-4 px-4 border-[#81B3B8] rounded  flex justify-evenly items-center gap-6 whitespace-nowrap">
        <div className="space-y-2">
    <p className="text-xs text-green-700">{status}</p>
    <h2 className="font-semibold">{value}</h2>
</div>
<div className="dark:bg-icon-dark-blue bg-[#DBE9FF] px-2 py-2 rounded-lg text-[#2A848D]">
{icon}
</div>
    </div>
        <p className="text-xs dark:text-[#424242] text-gray-700 mt-4">{title}</p>
  </div>
);
export default SummaryCard