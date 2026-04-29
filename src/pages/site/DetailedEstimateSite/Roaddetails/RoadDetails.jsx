import React from "react";
import Table from "../../../../components/Table";
import { roaddetailsData } from "../../../../components/Data";


const RoadDetails = () => {
  const roaddetails = [
    {
      label: "Item Description",
      key: "item_description",
    },
    {
      label: "Number",
      key: "number",
    },
    {
      label: "Length",
      key: "length",
    },
    {
      label: "Breadth",
      key: "breadth",
    },
    {
      label: "Density",
      key: "density",
    },
  ];
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={roaddetailsData}
      columns={roaddetails}
      routepoint={"viewroaddetailsSite"}
      exportModal={false}
    />
  );
};

export default RoadDetails;
