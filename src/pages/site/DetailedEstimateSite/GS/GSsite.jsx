import React from 'react'
import Table from '../../../../components/Table'
import { GSsiteData } from '../../../../components/Data';
import ViewGS from './ViewGS';

const GSsiteColumns = [

  { label: "Item Description", key: "itemdesc" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "units" },
  { label: " Rate", key: "rate" },
  { label: "Amount", key: "amount" },
];

const GSsite = () => {
  return (
     <Table
     contentMarginTop='mt-0'
      endpoint={GSsiteData}
      columns={GSsiteColumns}
      routepoint={"viewSE"}
      exportModal={false}
    />
  )
}

export default GSsite
