import loadingGif from "./loading.gif";
import folderIcon from "./folder.png";

const DataTable = ({ taskData, task }) => {
    let rowNo = 1;
    const headers = taskData?.headers || task?.headers;
    const rows = taskData?.rows || [];

    return (
        <div className="flex-1 overflow-auto border rounded-[6px] m-2">
            <div className="relative w-full h-full shadow-md sm:rounded-lg">
                {task && task.stage !== "todo" && headers ? (
                    <table
                        className={
                            "w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400" +
                            (rows.length === 0 ? " h-full" : "")
                        }
                    >
                        <thead className="text-xs text-gray-700 uppercase bg-gray-400">
                            <tr>
                                <th scope="col" className="sticky top-0 px-6 py-3 bg-gray-400">
                                    <div className="flex items-center">
                                        No.
                                        <a href="/">
                                            <svg
                                                className="w-3 h-3 ms-1.5"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                            </svg>
                                        </a>
                                    </div>
                                </th>
                                {headers.map((header) => {
                                    return (
                                        <th
                                            key={header.key}
                                            scope="col"
                                            className="sticky top-0 px-6 py-3 bg-gray-400"
                                        >
                                            <div className="flex items-center">
                                                {header.value}
                                                <a href="/">
                                                    <svg
                                                        className="w-3 h-3 ms-1.5"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className={rows.length === 0 ? "h-full" : ""}>
                            {rows.length > 0
                                ? rows.map((row) => (
                                      <tr
                                          key={row.id}
                                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                      >
                                          <th
                                              scope="row"
                                              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                          >
                                              {rowNo++}
                                          </th>
                                          {headers.map((header) => (
                                              <td
                                                  key={header.key}
                                                  className="px-6 py-4 whitespace-nowrap"
                                              >
                                                  {header.key === "url" ? (
                                                      <a
                                                          target="_blank"
                                                          href={row[header.key]}
                                                          rel="noreferrer"
                                                          className="text-blue-500 flex items-center"
                                                          title={row[header.key]}
                                                      >
                                                          Link
                                                          <svg
                                                              className="w-4 h-4 ml-1"
                                                              aria-hidden="true"
                                                              xmlns="http://www.w3.org/2000/svg"
                                                              fill="none"
                                                              viewBox="0 0 24 24"
                                                              stroke="currentColor"
                                                          >
                                                              <path
                                                                  strokeLinecap="round"
                                                                  strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M9 5l7 7-7 7"
                                                              />
                                                          </svg>
                                                      </a>
                                                  ) : (
                                                      row[header.key]
                                                  )}
                                              </td>
                                          ))}
                                      </tr>
                                  ))
                                : task?.stage === "ongoing" && (
                                      <tr className="h-full">
                                          <td
                                              colSpan={headers.length + 1}
                                              className="text-center h-full py-4"
                                          >
                                              <img
                                                  src={loadingGif}
                                                  alt="Loading..."
                                                  className="mx-auto mb-4 w-40 h-40"
                                              />
                                              <span className="text-3xl font-semibold text-gray-700 dark:text-gray-300">
                                                  Scrapping Data...
                                              </span>
                                          </td>
                                      </tr>
                                  )}
                        </tbody>
                    </table>
                ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-y-2/4 -translate-x-2/4">
                        <img src={folderIcon} alt="No Data" className="mx-auto mb-4 w-40 h-40" />
                        <span className="text-3xl font-semibold text-gray-700 dark:text-gray-300">
                            Nothing Scrapped
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
