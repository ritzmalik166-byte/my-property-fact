"use client";
import React, { useEffect, useRef } from "react";

export default function NewYearEffect() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const charsRef = useRef([]);
  const particlesRef = useRef(99);
  const currentRef = useRef(-1);
  const wRef = useRef(0);
  const hRef = useRef(0);

  const duration = 5000;

  useEffect(() => {
    const str = ["Happy", "New", "Year", "2026"];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const makeChar = (c) => {
      const tmp = document.createElement("canvas");
      const size = (tmp.width = tmp.height = wRef.current < 400 ? 300 : 450);
      const tmpCtx = tmp.getContext("2d");
      if (!tmpCtx) return [];

      tmpCtx.font = `bold ${size}px Arial`;
      tmpCtx.fillStyle = "white";
      tmpCtx.textBaseline = "middle";
      tmpCtx.textAlign = "center";
      tmpCtx.fillText(c, size / 2, size / 2);
      const char2 = tmpCtx.getImageData(0, 0, size, size);
      const char2particles = [];

      for (let i = 0; char2particles.length < particlesRef.current; i++) {
        const x = size * Math.random();
        const y = size * Math.random();
        const offset = parseInt(String(y)) * size * 4 + parseInt(String(x)) * 4;
        if (char2.data[offset]) {
          char2particles.push([x - size / 2, y - size / 2]);
        }
      }
      return char2particles;
    };

    const resize = () => {
      wRef.current = canvas.width = window.innerWidth;
      hRef.current = canvas.height = window.innerHeight;
      particlesRef.current = window.innerWidth < 400 ? 80 : 150;
    };

    const makeChars = (t) => {
      const actual = parseInt(String(t / duration)) % str.length;
      if (currentRef.current === actual) return;
      currentRef.current = actual;
      charsRef.current = [...str[actual]].map(makeChar);
    };

    const circle = (x, y, r) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r, 0, 0, 6.283);
      ctx.fill();
    };

    const rocket = (x, y, id, t) => {
      ctx.fillStyle = "white";
      const r = 3 - 3 * t + Math.pow(t, 15 * t) * 24;
      y = hRef.current - y * t;
      circle(x, y, r);
    };

    const explosion = (pts, x, y, id, t) => {
      const dy = t * t * t * 20;
      let r = Math.sin(id) * 2 + 5;
      r = t < 0.5 ? (t + 0.5) * t * r : r - t * r;
      ctx.fillStyle = `hsl(${id * 55}, 55%, 55%)`;
      pts.forEach((xy, i) => {
        if (i % 20 === 0) {
          ctx.fillStyle = `hsl(${id * 55}, 55%, ${55 + t * Math.sin(t * 55 + i) * 45}%)`;
        }
        circle(t * xy[0] + x, hRef.current - y + t * xy[1] + dy, r);
      });
    };

    const firework = (t, i, pts) => {
      t -= i * 200;
      const id = i + charsRef.current.length * parseInt(String(t - (t % duration)));
      t = (t % duration) / duration;
      let dx = ((i + 1) * wRef.current) / (1 + charsRef.current.length);
      dx += Math.min(0.33, t) * 100 * Math.sin(id);
      let dy = hRef.current * 0.5;
      dy += Math.sin(id * 4547.411) * hRef.current * 0.1;
      if (t < 0.33) {
        rocket(dx, dy, id, t * 3);
      } else {
        explosion(pts, dx, dy, id, Math.min(1, Math.max(0, t - 0.33) * 2));
      }
    };

    const render = (t) => {
      makeChars(t);
      animationFrameRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, wRef.current, hRef.current);
      charsRef.current.forEach((pts, i) => firework(t, i, pts));
    };

    // Initialize
    resize();
    animationFrameRef.current = requestAnimationFrame(render);

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9998,
        pointerEvents: "none",
      }}
    />
  );
}