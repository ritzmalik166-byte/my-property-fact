"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";

const PAGE_SIZE = 12;
const VISIBLE_LOCATIONS = 4;
const ALL = "all";

function text(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return text(value).toLowerCase();
}

/** Unique values of `field` with counts, most common first. */
function countBy(projects, field) {
  const counts = new Map();
  for (const project of projects) {
    const value = text(project[field]);
    if (value) counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function priceNumber(value) {
  const number = Number.parseFloat(text(value).replace(/,/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function PillGroup({ label, options, value, onChange }) {
  if (!options.length) return null;
  return (
    <div className="ap-filter-group">
      <h4>{label}</h4>
      <div className="ap-pill-list">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              type="button"
              key={option.value}
              className={`ap-pill${active ? " is-active" : ""}`}
              aria-pressed={active}
              onClick={() => onChange(active ? "" : option.value)}
            >
              {option.value}
              <span>{option.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocationsModal({ locations, total, value, onSelect, onClose }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const filtered = locations.filter((location) => normalize(location.value).includes(normalize(query)));

  return (
    <div className="ap-modal-backdrop" onClick={onClose}>
      <div
        className="ap-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ap-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ap-modal__header">
          <h3 id="ap-modal-title">All locations</h3>
          <button type="button" className="ap-icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ap-modal__search">
          <input
            type="search"
            value={query}
            placeholder="Search location"
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </div>

        <div className="ap-modal__list">
          {!query ? (
            <button
              type="button"
              className={`ap-modal__item${value === ALL ? " is-active" : ""}`}
              onClick={() => onSelect(ALL)}
            >
              All locations <span>{total}</span>
            </button>
          ) : null}
          {filtered.map((location) => (
            <button
              type="button"
              key={location.value}
              className={`ap-modal__item${value === location.value ? " is-active" : ""}`}
              onClick={() => onSelect(location.value)}
            >
              {location.value} <span>{location.count}</span>
            </button>
          ))}
          {!filtered.length ? <p className="ap-modal__empty">No locations match “{query}”.</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function AbroadProjectsClient({ projects = [] }) {
  const [location, setLocation] = useState(ALL);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const locations = useMemo(() => countBy(projects, "cityName"), [projects]);

  const visibleLocations = useMemo(() => {
    const top = locations.slice(0, VISIBLE_LOCATIONS);
    if (location === ALL || top.some((l) => l.value === location)) return top;
    const selected = locations.find((l) => l.value === location);
    return selected ? [...top.slice(0, VISIBLE_LOCATIONS - 1), selected] : top;
  }, [locations, location]);

  const inLocation = useMemo(
    () => (location === ALL ? projects : projects.filter((p) => text(p.cityName) === location)),
    [projects, location],
  );

  const areas = useMemo(() => countBy(inLocation, "projectLocality"), [inLocation]);
  const propertyTypes = useMemo(() => countBy(inLocation, "propertyTypeName"), [inLocation]);
  const statuses = useMemo(() => countBy(inLocation, "projectStatusName"), [inLocation]);

  const filteredProjects = useMemo(() => {
    const query = normalize(search);

    const result = inLocation.filter((project) => {
      if (query) {
        const haystack = [
          project.projectName,
          project.builderName,
          project.projectLocality,
          project.projectAddress,
          project.cityName,
          project.projectConfiguration,
        ].map(normalize).join(" ");
        if (!haystack.includes(query)) return false;
      }
      if (area && text(project.projectLocality) !== area) return false;
      if (propertyType && text(project.propertyTypeName) !== propertyType) return false;
      if (status && text(project.projectStatusName) !== status) return false;
      return true;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => (priceNumber(a.projectPrice) ?? Infinity) - (priceNumber(b.projectPrice) ?? Infinity));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (priceNumber(b.projectPrice) ?? -Infinity) - (priceNumber(a.projectPrice) ?? -Infinity));
    } else if (sortBy === "name") {
      result.sort((a, b) => text(a.projectName).localeCompare(text(b.projectName)));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [inLocation, search, area, propertyType, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageProjects = filteredProjects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const activeFilters = [area, propertyType, status].filter(Boolean).length;

  function selectLocation(value) {
    setLocation(value);
    setArea("");
    setPage(1);
    setLocationsOpen(false);
  }

  function update(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setArea("");
    setPropertyType("");
    setStatus("");
    setSearch("");
    setPage(1);
  }

  function goToPage(number) {
    setPage(number);
    document.getElementById("ap-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filterGroups = (
    <>
      <PillGroup label="Area" options={areas} value={area} onChange={update(setArea)} />
      <PillGroup label="Property type" options={propertyTypes} value={propertyType} onChange={update(setPropertyType)} />
      <PillGroup label="Status" options={statuses} value={status} onChange={update(setStatus)} />
    </>
  );

  return (
    <div className="ap-results" id="ap-results">
      <div className="ap-toolbar">
        <div className="ap-locations" role="group" aria-label="Filter by location">
          <button
            type="button"
            className={`ap-chip${location === ALL ? " is-active" : ""}`}
            aria-pressed={location === ALL}
            onClick={() => selectLocation(ALL)}
          >
            All <span>{projects.length}</span>
          </button>
          {visibleLocations.map((l) => (
            <button
              type="button"
              key={l.value}
              className={`ap-chip${location === l.value ? " is-active" : ""}`}
              aria-pressed={location === l.value}
              onClick={() => selectLocation(l.value)}
            >
              {l.value} <span>{l.count}</span>
            </button>
          ))}
          {locations.length > VISIBLE_LOCATIONS ? (
            <button type="button" className="ap-chip ap-chip--more" onClick={() => setLocationsOpen(true)}>
              See all
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="ap-search">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={search}
            placeholder="Search project, developer or area"
            onChange={(event) => update(setSearch)(event.target.value)}
            aria-label="Search projects"
          />
          {search ? (
            <button type="button" className="ap-icon-button" onClick={() => update(setSearch)("")} aria-label="Clear search">
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div className="ap-layout">
        <aside className="ap-sidebar" aria-label="Filters">
          <div className="ap-sidebar__head">
            <h3>Filters</h3>
            {activeFilters ? (
              <button type="button" onClick={clearFilters}>Clear all</button>
            ) : null}
          </div>
          {filterGroups}
        </aside>

        <section className="ap-main" aria-live="polite">
          <div className="ap-summary">
            <p>
              <strong>{filteredProjects.length}</strong>{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
              {location !== ALL ? <> in {location}</> : null}
            </p>

            <div className="ap-summary__actions">
              <button type="button" className="ap-filter-toggle" onClick={() => setFiltersOpen(true)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filters{activeFilters ? ` (${activeFilters})` : ""}
              </button>

              <label className="ap-sort">
                <span>Sort</span>
                <select value={sortBy} onChange={(event) => update(setSortBy)(event.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {pageProjects.length ? (
            <div className="ap-grid">
              {pageProjects.map((project) => (
                <ProjectCard key={project.id || project.slugURL || project.projectName} project={project} />
              ))}
            </div>
          ) : (
            <div className="ap-empty">
              <h3>No matching projects</h3>
              <p>Try a different search or clear some filters.</p>
              <button type="button" onClick={clearFilters}>Clear filters</button>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="ap-pagination" aria-label="Project pages">
              <button type="button" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)} aria-label="Previous page">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  type="button"
                  key={number}
                  className={number === safePage ? "is-active" : ""}
                  aria-current={number === safePage ? "page" : undefined}
                  onClick={() => goToPage(number)}
                >
                  {number}
                </button>
              ))}
              <button type="button" disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)} aria-label="Next page">›</button>
            </nav>
          ) : null}
        </section>
      </div>

      {locationsOpen ? (
        <LocationsModal
          locations={locations}
          total={projects.length}
          value={location}
          onSelect={selectLocation}
          onClose={() => setLocationsOpen(false)}
        />
      ) : null}

      {filtersOpen ? (
        <div className="ap-drawer-backdrop" onClick={() => setFiltersOpen(false)}>
          <div className="ap-drawer" role="dialog" aria-modal="true" aria-label="Filters" onClick={(event) => event.stopPropagation()}>
            <div className="ap-drawer__header">
              <h3>Filters</h3>
              <button type="button" className="ap-icon-button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">×</button>
            </div>
            <div className="ap-drawer__body">{filterGroups}</div>
            <div className="ap-drawer__footer">
              <button type="button" onClick={clearFilters}>Reset</button>
              <button type="button" onClick={() => setFiltersOpen(false)}>
                Show {filteredProjects.length} projects
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
