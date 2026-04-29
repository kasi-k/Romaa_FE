import React from 'react'
import Table from '../../../../components/Table';
import { GSsiteData } from '../../../../components/Data';

const BillQtySite = () => {

    const BillQtyColumns = [
        { label: "Item Description", key: "itemdesc" },
        { label: "Quantity", key: "quantity" },
        { label: "Units", key: "units" },
        { label: "Rate", key: "rate" },
        { label: "Amount", key: "amount" },
    ];

  return (
    <Table
        contentMarginTop='mt-0'
        endpoint={GSsiteData} 
        columns={BillQtyColumns}
        routepoint={"viewBillQty"} 
        exportModal={false} 
        />
  )
}

export default BillQtySite
