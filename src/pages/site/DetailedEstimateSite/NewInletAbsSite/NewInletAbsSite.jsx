import React from 'react'
import { Label } from 'recharts'
import Table from '../../../../components/Table'
import { GSsiteData, newInletsite } from '../../../../components/Data'

const NewInletAbsSite = () => {
    const newInletAbs =[
        {label: "Item Description", key: "itemdesc" },
        {label: "Quantity", key: "quantity" },
        {label: "Rate", key: "rate" },
        {label: "Amount", key: "amount" },  
    ]
  return (
    <Table
        contentMarginTop='mt-0'
        endpoint={GSsiteData}
        columns={newInletAbs}
        routepoint={"viewNewInletAbs"}
        exportModal={false}
    />
  )
}

export default NewInletAbsSite
