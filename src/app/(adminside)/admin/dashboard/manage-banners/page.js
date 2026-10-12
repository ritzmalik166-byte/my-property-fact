import axios from "axios";
import ManageBanners from "./manageBanners";
export const dynamic = 'force-dynamic';
//Fetching all banners of projects from api
const fetchBannerImages = async () => {
  const projectResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}project-banner/get-all`
  );
  const list = projectResponse.data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
  return list;
}
export default async function ManageBannersPage() {
  const list = await fetchBannerImages();
  return <ManageBanners list={list} />
}
