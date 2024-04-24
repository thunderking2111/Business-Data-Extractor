import useTagInput from "../hooks/useTags";
import TagField from "./TagField";

const FormPage = ({ category }) => {
    //define the MaxTags
    const MAX_TAGS = 5;

    //Retrieve all the returned items from the hook
    const { tags, handleAddTag, handleRemoveTag } = useTagInput(MAX_TAGS); // pass the maximum tags

    return (
        <div className="flex justify-center gap-y-4">
            <form>
                <TagField
                    category={category}
                    tags={tags}
                    addTag={handleAddTag}
                    removeTag={handleRemoveTag}
                    maxTags={MAX_TAGS}
                />
            </form>
        </div>
    );
};

export default FormPage;
