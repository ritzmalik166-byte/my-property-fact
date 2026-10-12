import axios from "axios";
import ManageGallery from "./manageGallery";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";
export const dynamic = 'force-dynamic';
//Fetching all gallery images
const fetchGalleryImage = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}project-gallery/get-all`
  );
  const res = response.data;
  const list = res.map((item, index) => ({
    ...item,
    index: index + 1,
    id: item.projectId
  }));
  return list;
};

//Fetching all projects list
const fetchProjects = async () => {
  const projectResponse = await fetchAllProjects();
  return projectResponse;
};

export default async function ManageGalleryPage() {
  const [list, projectsList] = await Promise.all([
    fetchGalleryImage(),
    fetchProjects()
  ]);
  const newList = projectsList.filter(
    project => !list.some(item => item.projectId === project.id)
  );  
  return <ManageGallery list={list} projectsList={projectsList} newList={newList}/>
}