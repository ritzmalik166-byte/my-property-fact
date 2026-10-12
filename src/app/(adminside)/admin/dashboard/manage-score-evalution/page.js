import axios from "axios";
import ManageScoreEvalution from "./manageScoreEvalution";
export const dynamic = 'force-dynamic';
//Fetch all localities from api
const fetchAllLocalities = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}locality/get-all`
  );
  return res.data;
};

//Fetch all locality score from api
const fetchAllLocalityScore = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}locality-data/all`);
  const result = res.data.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
  return result;
};

export default async function ManageScoreEvalutionPage() {
  const localityList = await fetchAllLocalities();
  const scoreList = await fetchAllLocalityScore();
  return (
    <>
      <ManageScoreEvalution localityList={localityList} list={scoreList} />
    </>
  );
}
