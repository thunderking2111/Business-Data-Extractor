import { Select, ThemeProvider, Option } from "@material-tailwind/react";

const ResourceSelector = () => {
    const theme = {
        select: {
            styles: {
                base: {
                    container: {
                        minWidth: "",
                    },
                },
            },
        },
    };
    return (
        <div className="w-full">
            <ThemeProvider value={theme}>
                <Select label="Select Resource">
                    <Option>Material Tailwind HTML</Option>
                    <Option>Material Tailwind React</Option>
                    <Option>Material Tailwind Vue</Option>
                    <Option>Material Tailwind Angular</Option>
                    <Option>Material Tailwind Svelte</Option>
                </Select>
            </ThemeProvider>
        </div>
    );
};

export default ResourceSelector;
