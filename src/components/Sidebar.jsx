import { FormPage, ResourceSelector } from ".";

const Sidebar = () => {
    return (
        <div class="relative flex overflow-auto h-screen w-1/4 max-w-[300px] flex-col rounded-xl bg-white bg-clip-border p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5">
            <div class="p-4 mb-2">
                <h5 class="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                    Data Extractor
                </h5>
            </div>
            <hr class="my-2 border-blue-gray-50" />
            <div class="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
                <FormPage category="keyword" />
                <hr class="my-2 border-blue-gray-50" />
                <FormPage category="location" />
                <hr class="my-2 border-blue-gray-50" />
                <ResourceSelector />
                <hr class="my-2 border-blue-gray-50" />
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                    Start
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
