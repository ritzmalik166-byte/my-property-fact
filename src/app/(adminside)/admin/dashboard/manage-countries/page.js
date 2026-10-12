import axios from "axios";
import ManageCountry from "./manageCountry";
export const dynamic = 'force-dynamic';
const fetchAllCountries = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}country/get-all-countries`);
    const res = response.data.map((item, index)=> ({
        ...item,
        index: index + 1,
    }));
    return res;
}

export default async function ManageCountryPage() {
    const list = await fetchAllCountries();    
    return(
        <ManageCountry list={list}/>
    )
}