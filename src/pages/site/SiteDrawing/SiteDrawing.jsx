
import React from 'react'
import { siteDrawing } from '../../../components/Data'
import Table from '../../../components/Table'

const SiteDrawing = () => {
    const sitedrawingColumns = [
       { label: "Item Description", key: "itemdesc" },
       {label:"BOQ Qty", key:"boqQty"},
       {label:"Drawing Qty", key:"drawQty"},
       {label:"Unit", key:"units"},
       {label:"Price", key:"price"},
    ]
  return (
    <Table
      title="Site Management"
      subtitle="Site Drawing"
      pagetitle="Site Drawing"
      columns={sitedrawingColumns}
      endpoint={siteDrawing}
      EditModal={true}
      ViewModal={true}
      routepoint={"viewdrawing"}
      exportModal={false} 

    />
  )
}

export default SiteDrawing
