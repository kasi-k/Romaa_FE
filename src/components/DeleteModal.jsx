import { IoClose } from "react-icons/io5";
import Delete from "../assets/images/Delete.png";

const DeleteModal = ({
  deletetitle,
  onclose,
  onDelete,
  idKey,
  item,
}) => {
  return (
    <div className=" font-roboto-flex fixed inset-0 flex justify-center  items-center backdrop-grayscale-50  drop-shadow-lg  backdrop-blur-xs z-60">
      <div className="dark:bg-layout-dark bg-white rounded-md ">
          <button
            onClick={onclose}
            className=" cursor-pointer grid place-self-end -mx-4 -my-4 dark:bg-layout-dark bg-white py-2 px-2 rounded-full"
          >
            <IoClose className="size-[24px]" />
          </button>
          <div className="grid justify-center px-6 py-4 gap-6">
            <span className="place-self-center mt-6">
              <img src={Delete} alt="Delete Image" className="size-24" />
            </span>
            <p className="text-center font-semibold text-2xl">Are you sure ?</p>
            <p className="w-72 text-center font-normal text-sm">
              Are you sure ? Do you want to delete this {deletetitle}{" "}
              Permanently.
            </p>
          </div>
          <div className="flex justify-center gap-6 my-6 text-sm font-normal">
            <button
              className=" cursor-pointer border px-6 py-1.5 rounded-sm"
              onClick={onclose}
            >
              Cancel
            </button>
            <button
              className=" cursor-pointer dark:text-white bg-red-600 px-6 py-1.5 rounded-sm "
              onClick={async () => {
                await onDelete(item?.[idKey]);
                onclose();
              }}
            >
              Delete
            </button>
          </div>
      </div>
    </div>
  );
};

export default DeleteModal;
