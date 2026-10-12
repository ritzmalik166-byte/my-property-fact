import axios from "axios";
import ProjectTypes from "./projectTypes";
export const dynamic = 'force-dynamic';
//Fetch all types of projects
const fetchProjectType = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}project-types/get-all-types`
  );
  const res = response.data.map((item, index) => ({
    ...item,
    index: index + 1
  }))
  return res;
}
export default async function ProjectTypesPage() {
  const list = await fetchProjectType();
  return <ProjectTypes list={list} />
}
