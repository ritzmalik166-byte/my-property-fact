import axios from "axios";
import ManageFloorPlans from "./manageFloorPlans";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";
export const dynamic = 'force-dynamic';
//Fetching all floor plans from api
const fetchAllFloorPlans = async () => {
  const floorPlans = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}floor-plans/get-all`
  );
  const list = floorPlans.data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
  return list;
};


export default async function ManageFloorPlansPage() {
  const [list, projectList] = await Promise.all([
    fetchAllFloorPlans(),
    fetchAllProjects()
  ]);
  return <ManageFloorPlans list={list} projectsList={projectList} />
}
