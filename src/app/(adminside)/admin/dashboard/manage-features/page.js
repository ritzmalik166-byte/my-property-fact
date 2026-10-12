import axios from "axios";
import ManageFeatures from "./manageFeatures";

export const dynamic = 'force-dynamic';

// Fetching all features list
const fetchFeatures = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await axios.get(`${apiUrl}feature/get-all`);
    const list = response.data.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
    return list;
  } catch (error) {
    console.error("Error fetching features:", error);
    return [];
  }
};

export default async function FeaturesPage() {
  const list = await fetchFeatures();
  return <ManageFeatures list={list} />;
}

