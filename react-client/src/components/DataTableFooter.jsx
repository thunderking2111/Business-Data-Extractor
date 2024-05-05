const DataTableFooter = ({ taskData, task }) => {
    return (
        <div className="flex justify-between my-3 mx-2">
            <span>
                Current Keyword: <strong>{taskData.currentKeyword || "---"}</strong>
            </span>
            <span>Total Records Found: {taskData.rows.length || "0"}</span>
        </div>
    );
};

export default DataTableFooter;
