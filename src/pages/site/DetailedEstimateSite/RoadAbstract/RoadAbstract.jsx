import React from "react";
import Table from "../../../../components/Table";
import { roadabstractData } from "../../../../components/Data";


const RoadAbstract = () => {
 const column = [
  { label: "Item Description", key: "ItemDescription" },
  { label: "Quantity", key: "Quantity" },
  { label: "Unit", key: "Unit" },
  { label: "Rate", key: "Rate" },
  { label: "Amount", key: "Amount" }
];
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={roadabstractData}
      columns={column}
      routepoint={"viewroadabstractsite"}
      exportModal={false}
    />
  );
};

export default RoadAbstract;

