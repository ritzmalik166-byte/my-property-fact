"use client";

import { useEffect } from "react";
import { reloadOnChunkError } from "@/lib/chunkErrorReload";

// Catches errors thrown in the root layout, which segment error.jsx files cannot catch.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
    reloadOnChunkError(error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "64px 16px" }}>
        <h2>Something went wrong</h2>
        <p style={{ color: "#666" }}>Please refresh the page to continue.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 16, padding: "10px 20px", cursor: "pointer" }}
        >
          Refresh
        </button>
        <button
          onClick={() => reset()}
          style={{ marginTop: 16, marginLeft: 8, padding: "10px 20px", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
