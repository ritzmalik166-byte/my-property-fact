import axios from "axios";
import Builder from "./builder";

export const dynamic = 'force-dynamic';

//Fetching all builders list from api
const fetchBuilders = async () => {
  const builders = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}builder/get-all-builders`
  );  
  const res = builders.data;
  const builderResult = res.map((res, index) => ({
    ...res,
    index: index + 1,
  }));
  return builderResult;
};

export default async function BuilderPage() {
  const list = await fetchBuilders();
  return <Builder list={list} />
}
