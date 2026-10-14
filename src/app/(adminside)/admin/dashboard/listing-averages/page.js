"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import "../super-tracking/super-tracking.css";
import "../project-activity/project-activity.css";
import "./listing-averages.css";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toDateInputValue(d);
}

function startOfMonthIso() {
  const d = new Date();
  return toDateInputValue(new Date(d.getFullYear(), d.getMonth(), 1));
}

function formatLongDate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y || !m || !d) return iso || "";
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function adminFetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data;
}

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return Number(n).toLocaleString("en-IN");
}

function formatAvg(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function initials(name, email) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

const PRESETS = [
  { id: "7d", label: "Last 7 days", range: () => [daysAgoIso(6), daysAgoIso(0)] },
  { id: "30d", label: "Last 30 days", range: () => [daysAgoIso(29), daysAgoIso(0)] },
  { id: "month", label: "This month", range: () => [startOfMonthIso(), daysAgoIso(0)] },
  { id: "90d", label: "Last 90 days", range: () => [daysAgoIso(89), daysAgoIso(0)] },
  { id: "365d", label: "Last 12 months", range: () => [daysAgoIso(364), daysAgoIso(0)] },
];

const BASIS_OPTIONS = [
  { id: "avgPerDay", label: "Per day" },
  { id: "avgPerWeek", label: "Per week" },
  { id: "avgPerMonth", label: "Per month" },
];

const SORT_COLUMNS = {
  name: (row) => String(row.name || "").toLowerCase(),
  totalListings: (row) => row.totalListings,
  avgPerDay: (row) => row.avgPerDay,
  avgPerWeek: (row) => row.avgPerWeek,
  avgPerMonth: (row) => row.avgPerMonth,
  activeDays: (row) => row.activeDays,
  avgPerActiveDay: (row) => row.avgPerActiveDay,
  lastListedAt: (row) => row.lastListedAt || "",
};

export default function ListingAveragesPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const base = useMemo(() => getPublicApiBase(), []);

  const [preset, setPreset] = useState("30d");
  const [dateFrom, setDateFrom] = useState(() => daysAgoIso(29));
  const [dateTo, setDateTo] = useState(() => daysAgoIso(0));
  const [listingType, setListingType] = useState("ALL");
  const [userRole, setUserRole] = useState("ALL");
  const [basis, setBasis] = useState("avgPerDay");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "totalListings", dir: "desc" });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (listingType !== "ALL") params.set("listingType", listingType);
      if (userRole !== "ALL") params.set("userRole", userRole);
      const data = await adminFetchJson(
        `${base}admin/super/project-listings/averages?${params.toString()}`,
      );
      setReport(data);
    } catch (e) {
      setErr(e?.message || "Failed to load listing averages");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [base, dateFrom, dateTo, isSuperAdmin, listingType, userRole]);

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    void load();
  }, [load, isSuperAdmin, roleLoading]);

  const rows = useMemo(() => {
    const list = Array.isArray(report?.rows) ? report.rows : [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter((row) =>
          [row.name, row.email, row.userRole]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q)),
        )
      : list;
    const pick = SORT_COLUMNS[sort.key] || SORT_COLUMNS.totalListings;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = pick(a);
      const bv = pick(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return Number(b.totalListings || 0) - Number(a.totalListings || 0);
    });
  }, [query, report, sort]);

  const maxBasis = useMemo(
    () => rows.reduce((max, row) => Math.max(max, Number(row[basis] || 0)), 0),
    [basis, rows],
  );

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );
  };

  const sortIndicator = (key) => {
    if (sort.key !== key) return "";
    return sort.dir === "asc" ? " ▲" : " ▼";
  };

  const listingsHref = (row) => {
    const params = new URLSearchParams();
    if (row.email) params.set("email", row.email);
    else if (row.name) params.set("userName", row.name);
    if (report?.rangeStart) params.set("dateFrom", report.rangeStart);
    if (report?.rangeEnd) params.set("dateTo", report.rangeEnd);
    if (listingType !== "ALL") params.set("listingType", listingType);
    return `/admin/dashboard/project-activity?${params.toString()}`;
  };

  if (roleLoading) {
    return <div className="super-tracking__muted">Checking access…</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="super-tracking">
        <h1 className="super-tracking__title">Listing averages</h1>
        <p className="super-tracking__note">This page is available to Super Admin only.</p>
      </div>
    );
  }

  const summary = report?.summary || {};
  const days = Number(report?.days || 0);
  const basisLabel = BASIS_OPTIONS.find((b) => b.id === basis)?.label.toLowerCase() || "per day";

  return (
    <div className="super-tracking project-activity listing-averages">
      <p className="super-tracking__kicker">Super Admin · Listings</p>
      <h1 className="super-tracking__title">Average listings per person</h1>
      <p className="super-tracking__note">
        How many projects and portal listings each person adds on average. Averages are spread
        across every day in the selected range, so a quiet day counts as zero.
      </p>

      <div className="pa-quick">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`pa-chip${preset === item.id ? " pa-chip--active" : ""}`}
            onClick={() => {
              const [from, to] = item.range();
              setPreset(item.id);
              setDateFrom(from);
              setDateTo(to);
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className={`pa-chip${preset === "custom" ? " pa-chip--active" : ""}`}
          onClick={() => setPreset("custom")}
        >
          Custom
        </button>
        {preset === "custom" ? (
          <span className="la-custom">
            <input
              type="date"
              className="pa-date-input"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => e.target.value && setDateFrom(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              className="pa-date-input"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => e.target.value && setDateTo(e.target.value)}
            />
          </span>
        ) : null}
      </div>

      <div className="pa-range-note">
        {report
          ? `${formatLongDate(report.rangeStart)} → ${formatLongDate(report.rangeEnd)} · ${formatCount(days)} ${days === 1 ? "day" : "days"}`
          : "Loading range…"}
        {report?.truncated
          ? " · Showing the first 5,000 listings only — narrow the range for exact averages."
          : ""}
      </div>

      {err ? <div className="super-tracking__err">{err}</div> : null}

      <div className="super-tracking__metrics la-metrics">
        {[
          { label: "Total listings", value: formatCount(summary.totalListings) },
          { label: "People listing", value: formatCount(summary.contributors) },
          { label: "Avg per person", value: formatAvg(summary.avgPerContributor) },
          { label: "Avg per person / day", value: formatAvg(summary.avgPerContributorPerDay) },
          { label: "Team avg / day", value: formatAvg(summary.avgPerDay) },
        ].map((card) => (
          <div key={card.label} className="super-tracking__metric">
            <div className="super-tracking__metric-label">{card.label}</div>
            <div className="super-tracking__metric-value">{loading ? "—" : card.value}</div>
          </div>
        ))}
      </div>

      {summary.topContributor && !loading ? (
        <div className="la-top">
          Top lister: <strong>{summary.topContributor}</strong> with{" "}
          {formatCount(summary.topContributorListings)}{" "}
          {Number(summary.topContributorListings) === 1 ? "listing" : "listings"}
        </div>
      ) : null}

      <div className="pa-toolbar">
        <input
          type="search"
          className="pa-search"
          placeholder="Search name, email, or role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="pa-toolbar__right">
          <select
            className="la-select"
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            aria-label="Listing type"
          >
            <option value="ALL">All listing types</option>
            <option value="NORMAL">Normal projects</option>
            <option value="PORTAL">Portal / Broker</option>
          </select>
          <select
            className="la-select"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            aria-label="User role"
          >
            <option value="ALL">All roles</option>
            <option value="SUPERADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="BROKER">Broker</option>
            <option value="OWNER">Owner</option>
            <option value="USER">User</option>
          </select>
          <div className="super-tracking__tabs" role="tablist" aria-label="Average basis">
            {BASIS_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={basis === tab.id}
                className={`super-tracking__tab${basis === tab.id ? " super-tracking__tab--active" : ""}`}
                onClick={() => setBasis(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button type="button" className="super-tracking__btn" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="super-tracking__panel">
        <div className="super-tracking__panel-head">
          Listings by person
          <span className="pa-count">{loading ? "" : `${formatCount(rows.length)} people`}</span>
        </div>

        {loading && !rows.length ? (
          <div className="pa-skeleton" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pa-skeleton__row" />
            ))}
          </div>
        ) : !rows.length ? (
          <div className="pa-empty">
            <div className="pa-empty__title">No listings in this range.</div>
            <p>Try a wider date range or clear the filters.</p>
          </div>
        ) : (
          <div className="super-tracking__table-wrap pa-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th className="la-sortable" onClick={() => toggleSort("name")}>
                    Person{sortIndicator("name")}
                  </th>
                  <th>Role</th>
                  <th className="la-sortable" onClick={() => toggleSort("totalListings")}>
                    Total{sortIndicator("totalListings")}
                  </th>
                  <th>Normal / Portal</th>
                  <th className="la-sortable" onClick={() => toggleSort(basis)}>
                    Avg {basisLabel}
                    {sortIndicator(basis)}
                  </th>
                  <th className="la-sortable" onClick={() => toggleSort("activeDays")}>
                    Active days{sortIndicator("activeDays")}
                  </th>
                  <th className="la-sortable" onClick={() => toggleSort("avgPerActiveDay")}>
                    Avg / active day{sortIndicator("avgPerActiveDay")}
                  </th>
                  <th>Active / Pending / Rejected</th>
                  <th className="la-sortable" onClick={() => toggleSort("lastListedAt")}>
                    Last listed{sortIndicator("lastListedAt")}
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const value = Number(row[basis] || 0);
                  const width = maxBasis > 0 ? Math.max(4, (value / maxBasis) * 100) : 0;
                  return (
                    <tr key={row.userKey}>
                      <td className="super-tracking__mono">{idx + 1}</td>
                      <td>
                        <div className="pa-user">
                          <span className="pa-avatar" aria-hidden>
                            {initials(row.name, row.email)}
                          </span>
                          <div>
                            <div className="pa-name">{row.name || "—"}</div>
                            <div className="pa-email">{row.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td>{row.userRole || "—"}</td>
                      <td className="super-tracking__mono">
                        {formatCount(row.totalListings)}
                        <div className="la-share">{formatAvg(row.shareOfTotal)}%</div>
                      </td>
                      <td className="pa-nowrap">
                        {formatCount(row.normalProjects)} / {formatCount(row.portalListings)}
                      </td>
                      <td>
                        <div className="la-bar">
                          <span className="la-bar__value">{formatAvg(value)}</span>
                          <span className="la-bar__track" aria-hidden>
                            <span className="la-bar__fill" style={{ width: `${width}%` }} />
                          </span>
                        </div>
                      </td>
                      <td className="super-tracking__mono">
                        {formatCount(row.activeDays)}
                        {days ? <span className="la-share"> of {formatCount(days)}</span> : null}
                      </td>
                      <td className="super-tracking__mono">{formatAvg(row.avgPerActiveDay)}</td>
                      <td className="pa-nowrap">
                        <span className="pa-status pa-status--ok">{formatCount(row.activeListings)}</span>{" "}
                        <span className="pa-status pa-status--warn">{formatCount(row.pendingListings)}</span>{" "}
                        <span className="pa-status pa-status--danger">{formatCount(row.rejectedListings)}</span>
                      </td>
                      <td className="pa-nowrap">{row.lastListedDate || "—"}</td>
                      <td>
                        <Link className="pa-link" href={listingsHref(row)}>
                          View listings
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="la-foot">
          <Link href="/admin/dashboard/project-activity">Project listings by date</Link>
          <Link href="/admin/dashboard/portal-listing-stats">Portal listing counts</Link>
        </div>
      </div>
    </div>
  );
}
