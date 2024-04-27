import { ActionButtons, DataTable, DataTableFooter, Sidebar } from "./components";

const App = () => {
    return (
        <div className="flex w-screen h-screen gap-2">
            <Sidebar />
            <div className="w-full flex flex-col p-2 h-screen overflow-auto">
                <ActionButtons />
                <DataTable />
                <DataTableFooter />
            </div>
        </div>
    );
};

export default App;
