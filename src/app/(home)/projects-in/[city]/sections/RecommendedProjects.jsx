"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProjectCard from "../ProjectCard";
import Reveal from "./Reveal";

function Arrow({ direction }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "prev" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

export default function RecommendedProjects({ projects = [] }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const start = track.scrollLeft <= 4;
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges, { passive: true });
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const scrollByPage = (direction) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  };

  if (!projects.length) return null;

  return (
    <section className="ap-section" aria-labelledby="ap-recommended-title">
      <div className="abroad-container">
        <Reveal className="ap-section__head">
          <div>
            <span className="ap-section__eyebrow">Handpicked for you</span>
            <h2 id="ap-recommended-title">Recommended Properties</h2>
            <p>Top projects in India picked for NRI buyers and investors.</p>
          </div>
          <div className="ap-section__actions">
            <Link href="/projects" className="ap-text-link">View all</Link>
            <button type="button" className="ap-round-button" onClick={() => scrollByPage(-1)} disabled={edges.start} aria-label="Previous projects">
              <Arrow direction="prev" />
            </button>
            <button type="button" className="ap-round-button" onClick={() => scrollByPage(1)} disabled={edges.end} aria-label="Next projects">
              <Arrow direction="next" />
            </button>
          </div>
        </Reveal>

        <Reveal>
          <div className="ap-rail" ref={trackRef} onScroll={updateEdges}>
            {projects.map((project) => (
              <div className="ap-rail__item" key={project.id || project.slugURL}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
