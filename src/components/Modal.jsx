import { IoClose } from "react-icons/io5";

const Modal = ({ onclose, title, child, children, widthClassName = "lg:w-fit md:w-[500px] w-96" }) => {
  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50  drop-shadow-lg z-20">
      <div className={`mx-2 dark:bg-layout-dark bg-white rounded-lg shadow-lg py-2 ${widthClassName}`}>
        <div className="flex justify-end">
          <button
            onClick={onclose}
            className="cursor-pointer dark:bg-layout-dark bg-white rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-6 md:-my-5 -my-3 lg:shadow-md md:shadow-md shadow-none lg:py-2.5 md:py-2.5 py-0 lg:px-2.5 md:px-2.5 px-0"
          >
            <IoClose className="size-[24px]" />
          </button>
        </div>
        <h1 className="text-center font-medium text-2xl py-2">{title}</h1>
        {child ?? children}
      </div>
    </div>
  );
};

export default Modal;
