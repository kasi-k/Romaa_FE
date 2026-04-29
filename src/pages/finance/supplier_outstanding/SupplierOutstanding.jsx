import React from 'react'
import AccordionTable from '../../../components/AccordionTable'
import {SupplierOutstandingData} from "../../../components/Data"
const SupplierOutstanding = () => {

  const columns=[
    { label: "Date", key: "date" },
    { label: "Supplier", key: "supplier" },
    { label: "Amount", key: "amount" }
  ];

const nestedHeaders = ["Bill", "Amount", "Particles"];  return (
    <div><AccordionTable
  title="Finance"
  subtitle="Supplier Outstanding"
  pagetitle="Supplier Outstanding"
  data={SupplierOutstandingData}
  columns={columns}
  Action={true}
  FilterModal={true}
  exportModal={true}
  nestedHeaders={nestedHeaders}

/></div>
  )
}

export default SupplierOutstanding