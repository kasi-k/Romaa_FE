import React from 'react'
import Table from '../../../../components/Table'
import { newInletsite } from '../../../../components/Data'

const NewInletSite = () => {
    const newInlet =[
        { label: "Item Description", key: "itemdesc" },
        { label: "Number", key: "number" },
        { label:"Length", key: "length" },
        {label: "Breadth", key: "breadth" },
        {label:"Density", key: "density" },
        {label:"Content", key: "content" },
    ]
  return (
   <Table
        contentMarginTop='mt-0'
        endpoint={newInletsite}
        columns={newInlet}
        routepoint={"viewNewInlet"}
        exportModal={false}
    />
  )
}

export default NewInletSite
