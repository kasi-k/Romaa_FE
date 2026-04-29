const BOQRowDetails = ({ breakdown }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm ">
        <thead className=" font-semibold">
          <tr className="dark:bg-layout-dark bg-white border-b-2 dark:border-border-dark-grey border-input-bordergrey">
            <th className="p-3 rounded-l-md ">S.no</th>
            <th className="">Ref no</th>
            <th className="">Co Efficient</th>
            <th className="">Cost</th>
            <th className="">Unit</th>
            <th className="">Rate</th>
            <th className="rounded-r-md">Amount</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((item, idx) => (
            <tr key={idx} className="dark:bg-layout-dark bg-white border-b dark:border-border-dark-grey border-input-bordergrey text-center">
              <td className="p-2.5 rounded-l-md" >{idx + 1}</td>
              <td className="">{item.ref}</td>
              <td className="">{item.coefficient}</td>
              <td className="">₹{item.cost}</td>
              <td className="">{item.unit}</td>
              <td className="">{item.rate}</td>
              <td className="rounded-r-md">₹{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BOQRowDetails;
