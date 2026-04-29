import React from 'react'
import AccordionTable from '../../../../components/AccordionTable'
import {planedtableData} from "../../../../components/Data"
const TableReport = () => {

 const columns = [
 
  { label: "Description", key: "description" },
  { label: "Unit", key: "unit" },
  { label: "Quantity", key: "quantity" },
  { label: "Labor", key: "labor" },
  { label: "Actual Rate/Sqm", key: "actualRate" }
];

const nestedHeaders= ["Carpenter", "Helper", "Barbender", "Helper 2", "Amount paid"]
  return (
    <div><AccordionTable
    exportModal={false}
  data={planedtableData}
  columns={columns}
  ViewModal={true}
  routepoint={"/reports/plannedvsactual/viewtablereport"}
  nestedHeaders={nestedHeaders}

/></div>
  )
}

export default TableReport;