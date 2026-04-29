import { ClientSupplyMaterialsData} from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";



const Clientsupplycolumns = [
  { label: "Material name", key: "materialname" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate" },
  { label: "Supply Type", key: "supplytype" },
];

const ClientsupplyMaterials = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      endpoint={ClientSupplyMaterialsData}
      columns={Clientsupplycolumns}
    />
  );
};

export default ClientsupplyMaterials;
