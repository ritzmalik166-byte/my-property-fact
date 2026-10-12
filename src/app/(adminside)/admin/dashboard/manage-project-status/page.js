import axios from "axios";
import ManageProjectStatus from "./manageProjectStatus";
export const dynamic = 'force-dynamic';

const fetchProjectStatusList = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}project-status`
  );
  return response.data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
};

export default async function ManageProjectStatusPage() {
  const list = await fetchProjectStatusList();
  return (
    <>
      <ManageProjectStatus projectStatusList={list} />
    </>
  );
}
