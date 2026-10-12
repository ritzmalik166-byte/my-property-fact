import axios from "axios";
import ManageAminity from "./manageAmenity";
export const dynamic = 'force-dynamic';
//Fetching all amenities list
const fetchAmenities = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}amenity/get-all`
  );
  const list = response.data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
  return list;
};

export default async function AminitiesPage() {
  const list = await fetchAmenities();
  return <ManageAminity list={list} />
}
