import { useEffect } from "react";
import CustomSelect from "./CustomSelect";

const RES_PER_QUERY_LIST = [
    { value: "max", text: "Maximum" },
    { value: 10, text: "10" },
    { value: 20, text: "20" },
    { value: 40, text: "40" },
    { value: 80, text: "80" },
    { value: 120, text: "120" },
];

const DELAY_LIST = [
    { value: "random", text: "Random" },
    { value: 1000, text: "1 Second" },
    { value: 2000, text: "2 Second" },
    { value: 4000, text: "4 Second" },
    { value: 5000, text: "5 Second" },
    { value: 10000, text: "10 Second" },
];

const Sidebar = ({
    keywordsRef,
    locationsRef,
    useProxyRef,
    emailRef,
    delayRef,
    maxQueryRef,
    task,
}) => {
    const disabled = task ? task.stage !== "todo" : true;

    useEffect(() => {
        if (task?.locations && locationsRef.current) {
            locationsRef.current.value = task.locations.join("\n");
        }
    }, [task, locationsRef]);

    useEffect(() => {
        if (task?.keywords && keywordsRef.current) {
            keywordsRef.current.value = task.keywords.join("\n");
        }
    }, [task, keywordsRef]);

    useEffect(() => {
        if (task?.useProxy && useProxyRef.current) {
            useProxyRef.current.value = task.useProxy;
        }
    }, [task, useProxyRef]);

    useEffect(() => {
        if (task?.emailMandatody && emailRef.current) {
            emailRef.current.value = task.emailMandatody;
        }
    }, [task, emailRef]);

    useEffect(() => {
        if (task?.delay && delayRef.current) {
            delayRef.current.value = task.delay;
        }
    }, [task, delayRef]);

    useEffect(() => {
        if (task?.maxQueryLimit && maxQueryRef.current) {
            maxQueryRef.current.value = task.maxQueryLimit;
        }
    }, [task, maxQueryRef]);

    return (
        <div className="relative flex grow shrink-0 overflow-auto h-screen w-1/4 max-w-[300px] flex-col rounded-xl bg-blue-gray-50 bg-opacity-60 bg-clip-border p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5 gap-3">
            <div className="flex grow flex-col gap-3">
                {["Keywords", "Locations"].map((label) => (
                    <div key={label} className="w-full flex grow">
                        <div className="relative w-full flex grow">
                            <textarea
                                ref={label === "Keywords" ? keywordsRef : locationsRef}
                                disabled={disabled}
                                className="peer h-full grow shrink w-full resize-none rounded-[7px] border border-blue-gray-200 border-t-transparent bg-white px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                placeholder=" "
                            />
                            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                {label}
                            </label>
                        </div>
                    </div>
                ))}
                <div className="relative flex flex-col text-gray-700 bg-white shadow-md rounded-xl bg-clip-border p-3 gap-3">
                    <div className="flex items-center">
                        <input
                            ref={emailRef}
                            disabled={disabled}
                            id="checked-checkbox"
                            type="checkbox"
                            value=""
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                            htmlFor="checked-checkbox"
                            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Email mandatory
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            ref={useProxyRef}
                            disabled={disabled}
                            id="checked-checkbox"
                            type="checkbox"
                            value=""
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                            htmlFor="checked-checkbox"
                            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Use Proxies
                        </label>
                    </div>
                    <CustomSelect
                        ref={maxQueryRef}
                        disabled={disabled}
                        label={"Max Result Per Query"}
                        optionsList={RES_PER_QUERY_LIST}
                    />
                    <CustomSelect
                        ref={delayRef}
                        disabled={disabled}
                        label={"Delay"}
                        optionsList={DELAY_LIST}
                    />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
