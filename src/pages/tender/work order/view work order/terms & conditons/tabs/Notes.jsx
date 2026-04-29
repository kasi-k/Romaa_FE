import { NotesData } from "../../../../../../components/Data";
import Table from "../../../../../../components/Table";

const Notescolumns = [{ label: "Notes", key: "notes" }];

const Notes = () => {
  return (
    <Table
      contentMarginTop="mt-0"
      exportModal={false}
      endpoint={NotesData}
      columns={Notescolumns}
    />
  );
};

export default Notes;
