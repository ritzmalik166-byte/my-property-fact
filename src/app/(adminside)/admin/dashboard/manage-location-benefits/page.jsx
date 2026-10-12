import axios from "axios";
import ManageLocationBenefits from "./manageLocationBenefits";

export const dynamic = 'force-dynamic';

// Fetching all nearby benefits list
const fetchNearbyBenefits = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Match the pattern used in location-benifits/page.js - no leading slash on endpoint
    const response = await axios.get(`${apiUrl}nearby-benefit/get-all`);
    const list = response.data.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
    return list;
  } catch (error) {
    console.error("Error fetching nearby benefits:", error);
    console.error("Error details:", error.response?.data || error.message);
    console.error("Request URL:", `${process.env.NEXT_PUBLIC_API_URL}nearby-benefit/get-all`);
    return [];
  }
};

export default async function ManageLocationBenefitsPage() {
    const list = await fetchNearbyBenefits();
    return <ManageLocationBenefits allBenefits={list} />;
}