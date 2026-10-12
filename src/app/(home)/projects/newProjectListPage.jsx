"use client";
import { useEffect, useState } from "react";
import CommonBreadCrum from "../components/common/breadcrum";
import CommonHeaderBanner from "../components/common/commonheaderbanner";

export default function NewProjectListPage({ projects }) {
    const [loadingProjects, setLoadingProjects] = useState(true);
    useEffect(()=> {
        if(projects.length > 0) {
            setLoadingProjects(false);
        }
    }, []);
  return (
    <>
      <CommonHeaderBanner image={"project-banner.jpg"} headerText={"Projects"} />
      <CommonBreadCrum pageName={"Projects"} />
      <div className="container-fluid">
        <h1>This is new projecct list page.</h1>
        <h2>{projects.length === 0 ? "Loading...": projects.length}</h2>
      </div>
    </>
  );
}
