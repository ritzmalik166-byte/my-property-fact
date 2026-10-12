import axios from "axios";
import ManageLocality from "./manageLocalities";
export const dynamic = 'force-dynamic';
// fetch all cities 
const fetchAllCities = async () => {
    try {
        // Use the /city/all endpoint which is more reliable
        const city = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}city/all`);
        // Map the response to ensure consistent format
        const cityList = Array.isArray(city.data) ? city.data : [];
        return cityList.map((item, index) => ({
            ...item,
            // Ensure the format matches what the component expects
            name: item.name || item.cityName,
            id: item.id || item.districtId,
            index: index + 1
        }));
    } catch (error) {
        console.error("Error fetching cities:", error.response?.status, error.message);
        console.error("Error details:", error.response?.data);
        return [];
    }
}

// fetch all cities 
const fetchAllLocalities = async () => {
    const localities = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}locality/get-all`);
    const res = localities.data.map((item, index) => ({
        ...item,
        index: index + 1
    }));
    return res;
}

// fetch all cities 
const fetchAllProjectTypes = async () => {
    const localities = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}project-types/get-all`);
    const res = localities.data.map((item, index) => ({
        ...item,
        index: index + 1
    }));
    return res;
}

export default async function ManageLocalityPage() {
    const cityList = await fetchAllCities();
    const localityList = await fetchAllLocalities();
    const typeList = await fetchAllProjectTypes();
    return (
        <>
            <ManageLocality cityList={cityList} localityList={localityList} typeList={typeList}/>
        </>
    )
}