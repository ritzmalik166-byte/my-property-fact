"use client";

import * as React from "react";

const THOUGHTS = [
  { text: "Every great property starts with a single, honest conversation.", by: "MPF Team" },
  { text: "Small daily improvements lead to stunning long-term results.", by: "Robin Sharma" },
  { text: "Quality is not an act, it is a habit.", by: "Aristotle" },
  { text: "The best investment on earth is earth.", by: "Louis Glickman" },
  { text: "Don't wait to buy real estate. Buy real estate and wait.", by: "Will Rogers" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", by: "Robert Collier" },
  { text: "A satisfied customer is the best business strategy of all.", by: "Michael LeBoeuf" },
  { text: "Focus on being productive instead of busy.", by: "Tim Ferriss" },
  { text: "The secret of getting ahead is getting started.", by: "Mark Twain" },
  { text: "Do what you do so well that they will want to see it again and bring their friends.", by: "Walt Disney" },
  { text: "Clarity in every listing builds trust in every lead.", by: "MPF Team" },
  { text: "Opportunities don't happen. You create them.", by: "Chris Grosser" },
];

/** One thought per day, chosen by day of the year, so it stays the same on every refresh today. */
function thoughtOfTheDay() {
  const now = new Date();
  const day = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86_400_000);
  return THOUGHTS[day % THOUGHTS.length];
}

export function ThoughtCard() {
  const [thought, setThought] = React.useState(null);
  React.useEffect(() => setThought(thoughtOfTheDay()), []);

  return (
    <figure
      style={{
        margin: 0,
        height: "100%",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        padding: "28px 32px",
        borderRadius: 24,
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
        color: "#fff",
        boxShadow: "0 10px 30px -12px rgba(37, 99, 235, 0.55)",
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.8 }}>
        Thought of the day
      </span>
      <blockquote style={{ margin: 0, fontSize: 22, lineHeight: 1.4, fontWeight: 600 }}>
        {thought ? `“${thought.text}”` : " "}
      </blockquote>
      {thought && (
        <figcaption style={{ fontSize: 14, opacity: 0.85 }}>— {thought.by}</figcaption>
      )}
    </figure>
  );
}

export default ThoughtCard;
