import axios from "axios";
import ManageState from "./manageState";
export const dynamic = 'force-dynamic';

//fetching all country list
const fetchAllCountries = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}country/get-all-countries`);
    const res = response.data.map((item, index)=> ({
        ...item,
        index: index + 1,
        stateName: item.countryName
    }));
    return res;
}

//fetching all states list
const fetchAllStates = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}state/get-all`);
    const res = response.data.map((item, index)=> ({
        ...item,
        index: index + 1,
    }));
    return res;
}
export default async function ManageStatePage() {
    const [countryList, stateList] = await Promise.all([
        fetchAllCountries(),
        fetchAllStates()
    ]);
    return(
        <ManageState countryList = {countryList} stateList = {stateList}/>
    )
}