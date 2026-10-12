import axios from "axios";
import City from "./manageCity";
export const dynamic = 'force-dynamic';
//Fetching all cities from api
const fetchCities = async () => {
  const cityList = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}city/all`
  );
  const response = cityList.data.map((item, index) => ({
    ...item,
    index: index + 1
  }));  
  return response;
}

//Fetch all states
const fetchStates = async () => {
  const stateList = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}state/get-all`
  );
  const response = stateList.data.map((item, index) => ({
    ...item,
    index: index + 1
  }));  
  return response;
}

export default async function CityPage() {
  const cityList = await fetchCities();
  const stateList = await fetchStates();
  return <City list={cityList} stateList={stateList}/>
}
