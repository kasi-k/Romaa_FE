import React from "react";
import BOQRowDetails from "./BOQRowDetails";
import BOQSummary from "./BOQSummary";
import { IoChevronBackSharp } from "react-icons/io5";
import Button from "../../../../../components/Button";
import { useNavigate } from "react-router-dom";

const BOQTable = ({ data }) => {

    const navigate = useNavigate();
  return (
    <>
      <div className="mt-4 h-full overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="  font-semibold">
            <tr className="dark:bg-layout-dark bg-white border-b-2 dark:border-border-dark-grey border-input-bordergrey">
              <th className="p-3 rounded-l-md">S.no</th>
              <th className=" ">Item Description</th>
              <th className=" ">Quantity</th>
              <th className="">Units</th>
              <th className=" ">Final Rate</th>
              <th className="rounded-r-md">Amount</th>
            </tr>
          </thead>
          <tbody className="">
            {data.map((item, idx) => (
              <React.Fragment>
                <tr className=" text-center dark:bg-layout-dark bg-white " key={idx}>
                  <td className="p-2.5 rounded-l-md">{idx + 1}</td>
                  <td className="">{item.description}</td>
                  <td className="">₹{item.quantity.toLocaleString()}</td>
                  <td className=" ">{item.unit}</td>
                  <td className="">{item.finalRate}</td>
                  <td className="rounded-r-md">
                    ₹{item.amount.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td colSpan="6" className="px-8 py-4">
                    <BOQRowDetails breakdown={item.breakdown} />
                  </td>
                </tr>

                <tr>
                  <td colSpan="6" className="px-3 py-4 dark:bg-layout-dark bg-white rounded-md">
                    <BOQSummary summary={item.summary} />
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end py-2 ">
        <Button
          onClick={() => navigate("..?tab=2")}
          button_name="Back"
          button_icon={<IoChevronBackSharp />}
        />
      </div>
    </>
  );
};

export default BOQTable;
