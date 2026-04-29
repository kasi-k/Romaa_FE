import { GoArrowLeft } from "react-icons/go";
import { GoArrowRight } from "react-icons/go";

const Pagination = ({
  setCurrentPage,
  currentPage,
  totalPages
}) => {

  const displayText = `Showing  results for ${currentPage} out of ${totalPages}`;
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage === 1 || currentPage === 2) {
        pageNumbers.push(2);
        pageNumbers.push(3);
      } else if (currentPage === totalPages || currentPage === totalPages - 1) {
        pageNumbers.push(totalPages - 2);
        pageNumbers.push(totalPages - 1);
      } else {
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
      }

      if (!pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-between items-center  px-3 whitespace-nowrap overflow-auto no-scrollbar ">
      <div className="text-sm font-normal dark:text-white text-darkest-blue">
        <p className="">{displayText}</p>
      </div>

      <div className="flex items-center justify-center gap-4 ">
        <button
          className={` ${
            currentPage === 1
              ? "dark:text-white text-darkest-blue opacity-70 cursor-not-allowed "
              : "text-darkest-blue"
          }`}
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
        >
          <GoArrowLeft />
        </button>

        <button
          className={` ${
            currentPage === 1
              ? "dark:text-white text-darkest-blue opacity-70 cursor-not-allowed "
              : "text-darkest-blue"
          }`}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {generatePageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-4 py-2">
              ...
            </span>
          ) : (
            <button
              key={index}
              className={`px-2.5 py-1 text-sm rounded-md ${
                currentPage === page
                  ? "dark:bg-white bg-darkest-blue  px-2 py-1 font-medium dark:text-black text-white "
                  : "text-darkest-blue "
              }`}
              onClick={() => paginate(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className={` ${
            currentPage === totalPages
              ? " dark:text-white text-darkest-blue opacity-70 cursor-not-allowed"
              : "text-darkest-blue "
          }`}
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button
          className={` ${
            currentPage === totalPages
              ? " dark:text-white text-darkest-blue opacity-70 cursor-not-allowed"
              : "text-darkest-blue "
          }`}
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
        >
          <GoArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
