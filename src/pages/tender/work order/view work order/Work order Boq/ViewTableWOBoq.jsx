
import Title from '../../../../../components/Title';
import BOQTable from './BoqTable';

const dummyData = [
  {
    description: "Earth work excavation for foundation in all",
    quantity: 1480,
    unit: "M3",
    finalRate: 346.67,
    amount: 513042,
    breakdown: Array(5).fill({
      ref: "#23523",
      coefficient: "R/A co efficient",
      cost: 1480,
      unit: "Month",
      rate: 346.67,
      amount: 513042,
    }),
    summary: {
      "Total Weightage %": 1480,
      "Wastage Amount": 1480,
      "Loading / Unloading": 1480,
      "Handling Charges": 1480,
      "Base total for 1000 cum": 1480,
      "Qualifier value": 1480,
      "Qualifier Total for 1000 cum": 1480,
      "Base rate per cum": 1480,
      "Qualifier rate per cum": 1480,
      "Rounding off": 1480,
      "Net rate": 1480,
    },
  },
];


const ViewTableWOBoq = () => {
  return (
    <div>  <Title title="Tender Management" page_title="Bill Of Quantity" sub_title="Bill Of Quantity"/> <BOQTable data={dummyData} /></div>
  )
}

export default ViewTableWOBoq