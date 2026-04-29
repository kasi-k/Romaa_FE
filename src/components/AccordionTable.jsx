import React, { useEffect, useState } from "react";
import Pagination from "./Pagination";
import Filters from "./Filters";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import Title from "./Title";
import Button from "./Button";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import { LuEye } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const AccordionTable = ({
  title,
  subtitle,
  pagetitle,
  data,
  active_title,
  onExport,
  FilterModal,
  Action,
  exportModal = true,
  columns,
  ViewModal,
  routepoint,
  nestedHeaders,
  itemsPerPage = 10,
  searchTerm = "",
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModal, setFilterModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const navigate = useNavigate();

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setFilterModal(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toString().toLowerCase();
    const fromDate = filterParams.fromdate
      ? new Date(filterParams.fromdate)
      : null;
    const toDate = filterParams.todate ? new Date(filterParams.todate) : null;

    const filtered = data.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(lowerSearchTerm)
      );

      const formattedDate = item.date
        ? item.date.split("-").reverse().join("-")
        : null;
      const itemDate = formattedDate ? new Date(formattedDate) : null;

      const matchesDate =
        (!fromDate || (itemDate && !isNaN(itemDate) && itemDate >= fromDate)) &&
        (!toDate || (itemDate && !isNaN(itemDate) && itemDate <= toDate));

      return matchesSearch && matchesDate;
    });

    setFilteredData(filtered);
  }, [searchTerm, filterParams, data]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <div className="lg:flex lg:justify-between items-center">
        <Title
          title={title}
          sub_title={subtitle}
          active_title={active_title}
          page_title={pagetitle}
        />
        <div className="flex gap-3">
          {exportModal && (
            <Button
              button_icon={<TbFileExport size={22} />}
              button_name="Export"
              bgColor="dark:bg-layout-dark bg-white"
              textColor="dark:text-white text-darkest-blue"
              onClick={onExport}
            />
          )}
          {FilterModal && (
            <Button
              button_icon={<BiFilterAlt size={22} />}
              button_name="Filter"
              bgColor="dark:bg-layout-dark bg-white"
              textColor=" dark:text-white text-darkest-blue"
              onClick={() => setFilterModal(true)}
            />
          )}
        </div>
      </div>

      <div className="mt-4 overflow-y-auto no-scrollbar h-11/12">
        <div className="overflow-auto no-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="font-semibold dark:bg-layout-dark bg-white rounded-l-full text-sml border-b-4 dark:border-border-dark-grey border-light-blue">
                <th className="p-3.5 rounded-l-lg">S.no</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3">
                    <p className="flex items-center justify-center gap-2 text-base">
                      {col.label} <HiArrowsUpDown size={18} />
                    </p>
                  </th>
                ))}
                {(ViewModal || routepoint || Action) && <th className="py-3 px-4 rounded-r-lg">Action</th>}
              </tr>
            </thead>
            <tbody className="text-greyish dark:text-gray-200 text-sm font-light">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <React.Fragment key={globalIndex}>
                      <tr className="border-b-[3px] my-2 dark:bg-layout-dark dark:border-border-dark-grey bg-white border-light-blue text-center">
                        <td className="p-2 rounded-l-lg">{globalIndex + 1}</td>
                        {columns.map((col, i) => (
                          <td key={i}>{row[col.key]}</td>
                        ))}
                        <td className="rounded-r-lg">
                          <div className="flex justify-center my-2 gap-3">
                            <button
                              onClick={() => toggleRow(globalIndex)}
                              className="cursor-pointer bg-blue-200 text-lg rounded-sm p-0.5 text-blue-600"
                            >
                              {expandedRow === globalIndex ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {(ViewModal || routepoint) && (
                              <button
                                onClick={() => {
                                  if (routepoint) {
                                    navigate(`${routepoint}`, {
                                      state: { item: row },
                                    });
                                  }
                                }}
                                className="cursor-pointer bg-[#BAFFBA] p-1.5 rounded"
                              >
                                <LuEye size={14} className="text-[#008000]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {expandedRow === globalIndex && (
                        <tr>
                          <td colSpan={columns.length + 1} className="px-10 pl-28 py-1">
                            <div className="dark:bg-layout-dark bg-white p-2 py-5 rounded-md">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-indigo-200 dark:bg-indigo-400 font-semibold">
                                  <tr className="border-b-[3px] border-white dark:border-border-dark-grey">
                                    {nestedHeaders.map((header, i) => (
                                      <th key={i} className="py-3 px-4">{header}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-gray-200 dark:bg-overall_bg-dark">
                                  {row.nestedData?.map((nestedRow, i) => (
                                    <tr key={i} className="border-b-2 border-white dark:border-border-dark-grey">
                                      {nestedHeaders.map((header, j) => {
                                        const key = header
                                          .toLowerCase()
                                          .replace(/\s+/g, "")
                                          .replace(/[^a-z0-9]/gi, "");
                                        return (
                                          <td key={j} className="py-2 px-4">
                                            {nestedRow[key]}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="text-center py-10 text-gray-500"
                  >
                    No matching results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredData.length / itemsPerPage)}
        setCurrentPage={setCurrentPage}
      />

      {filterModal && (
        <Filters
          onclose={() => setFilterModal(false)}
          onFilter={handleFilter}
        />
      )}
    </div>
  );
};

export default AccordionTable;
