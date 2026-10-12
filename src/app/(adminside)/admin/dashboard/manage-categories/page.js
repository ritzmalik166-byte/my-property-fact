import axios from "axios";
import ManageBlogCategory from "./manageBlogCategories";
export const dynamic = 'force-dynamic';
// Fetching all categories list
const fetchCategoryList = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}blog-category/get-all`);
    const updatedList = response.data.map((item, index) => ({
        ...item,
        index: index + 1,
    }));

    return updatedList;
};

export default async function ManageBlogCategoryPage() {
    const list = await fetchCategoryList();
    return <ManageBlogCategory list={list} />
}