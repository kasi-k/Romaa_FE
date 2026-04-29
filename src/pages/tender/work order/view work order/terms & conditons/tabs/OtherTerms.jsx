import { OtherTermsData } from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";

const OtherTermscolumns = [
  { label: "Terms Title", key: "title" },
  { label: "Terms Description", key: "termsdescription" },
];

const OtherTerms = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      endpoint={OtherTermsData}
      columns={OtherTermscolumns}
    />
  );
};

export default OtherTerms;
