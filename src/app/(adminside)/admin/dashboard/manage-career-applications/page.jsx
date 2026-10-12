import ManageCareerApplications from "./manageCareerApplications";

async function fetchCareerApplications() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}career`, {
    cache: "no-store", // ensures fresh data each time (like getServerSideProps)
  });

  if (!response.ok) {
    throw new Error("Failed to fetch career applications");
  }

  const data = await response.json();

  return data.map((item, index) => ({
    index: index + 1,
    fullName:
      item.firstName && item.lastName
        ? `${item.firstName} ${item.lastName}`
        : "N/A",
    resumeFile: item.resumeFile
      ? `${process.env.NEXT_PUBLIC_IMAGE_URL}resume/${item.resumeFile}`
      : "N/A",
    emailId: item.emailId || "N/A",
    phoneNumber: item.phoneNumber || "N/A",
    createAt: new Date(item.createdAt)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "-"),
    id: item.id || "N/A",
  }));
}

export default async function ManageCareerApplicationsPage() {
  const applications = await fetchCareerApplications();
  return <ManageCareerApplications list={applications} />;
}
