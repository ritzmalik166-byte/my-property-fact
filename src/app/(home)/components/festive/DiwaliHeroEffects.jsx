"use client";

import { useEffect, useRef } from "react";
import "./diwali.css";

/* Live fireworks over the Diwali hero banner. Everything is laid out from the
   hero box itself (not from artwork pixels), so it works for every crop of the
   banner: bursts fill the sky band, steer around the greeting in the artwork
   (the invisible .mpf-diwali-zone, measured from the DOM), and rockets rise
   from behind the towers. The canvas is drawn at device pixel ratio, so it
   stays sharp on retina / 3x screens. Normal bursts only — no shaped shells. */
const SKY = { y0: 0.07, y1: 0.42 }; // burst band, as a fraction of box height
const LAUNCH_Y = 0.62; // rockets start behind the skyline
const EMBER_BAND = { y0: 0.62, y1: 0.95 };

const PALETTES = [
  [[255, 214, 120], [255, 170, 60], [255, 245, 210]],
  [[255, 110, 180], [255, 200, 230], [255, 214, 120]],
  [[120, 240, 230], [200, 255, 250], [255, 230, 160]],
  [[190, 140, 255], [255, 160, 220], [255, 255, 255]],
  [[255, 120, 70], [255, 200, 90], [255, 240, 200]],
  [[130, 255, 150], [255, 230, 120], [255, 255, 255]],
];
const GOLD = [[255, 210, 120], [255, 186, 80], [255, 240, 200]];

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export default function DiwaliHeroEffects() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let unit = 1;
    let title = { x0: 0, x1: 0, y0: 0, y1: 0 };
    let compact = false;
    let maxParticles = 700;

    let stars = [];
    const rockets = [];
    const particles = [];
    const flashes = [];
    const glints = [];
    const shootingStars = [];

    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let nextLaunch = 0;
    let nextGlint = 0;
    let nextShooting = 0;
    let nextEmber = 0;
    let openingShow = true;

    const inTitle = (x, y, pad = 0) =>
      x > title.x0 - pad && x < title.x1 + pad && y > title.y0 - pad && y < title.y1 + pad;

    function measureTitle() {
      const el = host.querySelector(".mpf-diwali-zone");
      if (!el) {
        title = { x0: 0, x1: 0, y0: 0, y1: 0 };
        return;
      }
      const hr = host.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      title = { x0: r.left - hr.left, x1: r.right - hr.left, y0: r.top - hr.top, y1: r.bottom - hr.top };
    }

    function buildStars() {
      const count = Math.round(w / (compact ? 22 : 26));
      const skyBottom = h * (SKY.y1 + 0.04);
      stars = [];
      for (let i = 0; i < count * 3 && stars.length < count; i += 1) {
        const x = Math.random() * w;
        const y = Math.random() * skyBottom;
        if (inTitle(x, y, 6)) continue;
        stars.push({
          x,
          y,
          r: rand(0.5, 1.4) * unit,
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.0015, 0.004),
          sparkle: Math.random() < 0.14,
        });
      }
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      compact = w < 768;
      // small canvases can afford full 3x; wide desktop canvases cap at 2x
      dpr = Math.min(window.devicePixelRatio || 1, compact ? 3 : 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      unit = Math.max(0.7, Math.min(1.3, h / 420));
      measureTitle();
      maxParticles = compact ? 320 : 750;
      buildStars();
    }

    /** Burst targets stay in the sky band and keep clear of the greeting. */
    function pickBurstPoint() {
      const yTop = Math.max(16 * unit, h * SKY.y0);
      const yBot = Math.max(yTop + 20, h * SKY.y1);
      const pad = 34 * unit;
      for (let i = 0; i < 24; i += 1) {
        const x = rand(0.05, 0.95) * w;
        const y = rand(yTop, yBot);
        if (!inTitle(x, y, pad)) return { x, y };
      }
      return { x: Math.random() < 0.5 ? rand(0.04, 0.14) * w : rand(0.86, 0.96) * w, y: rand(yTop, yBot) };
    }

    function launch(target) {
      const { x: tx, y: ty } = target || pickBurstPoint();
      const sx = tx + rand(-50, 50) * unit;
      const sy = Math.min(h - 40, Math.max(h * LAUNCH_Y, ty + 120 * unit));
      const g = 0.06 * unit;
      const dist = Math.max(40, sy - ty);
      const vy = -Math.sqrt(2 * g * dist);
      const frames = -vy / g;
      const r = Math.random();
      // normal bursts only — no shaped shells (heart / ring)
      let type = "peony";
      if (r < 0.25) type = "willow";
      else if (r < 0.4) type = "strobe";
      rockets.push({
        x: sx, y: sy, px: sx, py: sy, vx: (tx - sx) / frames, vy, g,
        type, palette: type === "willow" ? GOLD : pick(PALETTES),
      });
    }

    function addParticle(p) {
      if (particles.length >= maxParticles) return;
      particles.push({
        px: p.x, py: p.y, life: 1, flicker: false, crackle: false, glow: false, ...p,
      });
    }

    function explode(rk) {
      const { x, y, palette, type } = rk;
      const radius = rand(72, 112) * unit * (compact ? 0.6 : 1);
      flashes.push({ x, y, life: 1, r: radius * 0.9, c: palette[0] });

      const n = Math.round((type === "willow" ? 70 : 90) * (compact ? 0.6 : 1));
      for (let i = 0; i < n; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const spd = (radius / 40) * Math.cbrt(Math.random()) * rand(0.85, 1.05);
        const willow = type === "willow";
        addParticle({
          x, y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          drag: willow ? 0.962 : 0.975,
          g: (willow ? 0.045 : 0.028) * unit,
          decay: willow ? rand(0.0065, 0.009) : rand(0.012, 0.019),
          size: (willow ? 1.8 : 2.2) * unit,
          color: pick(palette),
          flicker: type === "strobe" || willow,
          crackle: willow ? Math.random() < 0.35 : type === "peony" && Math.random() < 0.12,
          glow: type !== "willow",
        });
      }
    }

    function crackle(p) {
      for (let i = 0; i < 4; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const spd = rand(0.6, 1.6) * unit;
        addParticle({
          x: p.x, y: p.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, drag: 0.9, g: 0.02 * unit,
          decay: rand(0.05, 0.08), size: 1 * unit, color: [255, 250, 220],
        });
      }
    }

    function sparkleAt(x, y, count, spread = 1.2) {
      for (let i = 0; i < count; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const spd = rand(0.3, spread) * unit;
        addParticle({
          x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 0.3 * unit, drag: 0.94, g: 0.03 * unit,
          decay: rand(0.03, 0.05), size: rand(0.8, 1.5) * unit, color: pick(GOLD), flicker: true,
        });
      }
    }

    function drawStar4(x, y, size, alpha, color = [255, 248, 225]) {
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = Math.max(0.6, size * 0.16);
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      ctx.fillStyle = rgba(color, alpha);
      ctx.beginPath();
      ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawGlow(x, y, r, c, a) {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, rgba(c, a));
      grd.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = grd;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    function schedule(now) {
      if (openingShow) {
        openingShow = false;
        const n = compact ? 2 : 3;
        for (let i = 0; i < n; i += 1) window.setTimeout(() => launch(), 250 + i * 380);
        nextLaunch = now + 2200;
      }
      if (now >= nextLaunch) {
        launch();
        if (!compact && Math.random() < 0.3) window.setTimeout(() => launch(), 220);
        nextLaunch = now + (compact ? rand(1500, 2600) : rand(900, 1900));
      }
      if (now >= nextGlint && glints.length < 3 && title.x1 > title.x0) {
        glints.push({
          x: rand(title.x0 + 8, title.x1 - 8),
          y: rand(title.y0 + 6, title.y0 + (title.y1 - title.y0) * 0.62),
          t: 0,
          size: rand(5, 9) * unit,
        });
        nextGlint = now + rand(350, 900);
      }
      if (now >= nextShooting) {
        if (nextShooting) {
          const fromLeft = Math.random() < 0.5;
          shootingStars.push({
            x: fromLeft ? rand(0, w * 0.2) : rand(w * 0.8, w),
            y: rand(4, 40) * unit,
            vx: (fromLeft ? 1 : -1) * rand(7, 10) * unit,
            vy: rand(1.6, 2.6) * unit,
            life: 1,
          });
        }
        nextShooting = now + rand(6000, 11000);
      }
      if (now >= nextEmber) {
        addParticle({
          x: rand(0.02, 0.98) * w,
          y: rand(EMBER_BAND.y0, EMBER_BAND.y1) * h,
          vx: rand(-0.15, 0.15), vy: -rand(0.35, 0.75) * unit, drag: 0.998, g: -0.002 * unit,
          decay: rand(0.004, 0.008), size: rand(1, 2) * unit, color: pick(GOLD), ember: true,
          phase: Math.random() * 6.28, flicker: false,
        });
        nextEmber = now + (compact ? 260 : 140);
      }
    }

    function frame(now) {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 16.667, 3) : 1;
      last = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      for (const s of stars) {
        const tw = (0.5 + 0.5 * Math.sin(now * s.speed + s.phase)) ** 3;
        const a = 0.15 + 0.85 * tw;
        if (s.sparkle) {
          drawStar4(s.x, s.y, s.r * 3.2 * (0.6 + tw * 0.6), a);
        } else {
          ctx.fillStyle = `rgba(255,250,235,${a})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      schedule(now);

      for (let i = glints.length - 1; i >= 0; i -= 1) {
        const gl = glints[i];
        gl.t += 0.025 * dt;
        if (gl.t >= 1) {
          glints.splice(i, 1);
          continue;
        }
        const k = Math.sin(gl.t * Math.PI);
        drawGlow(gl.x, gl.y, gl.size * 1.8, [255, 220, 150], 0.35 * k);
        drawStar4(gl.x, gl.y, gl.size * k, k);
      }

      for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
        const s = shootingStars[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.02 * dt;
        if (s.life <= 0 || s.x < -60 || s.x > w + 60) {
          shootingStars.splice(i, 1);
          continue;
        }
        const grd = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
        grd.addColorStop(0, `rgba(255,255,255,${s.life})`);
        grd.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.6 * unit;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9);
        ctx.stroke();
      }

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const rk = rockets[i];
        rk.px = rk.x;
        rk.py = rk.y;
        rk.x += rk.vx * dt;
        rk.y += rk.vy * dt;
        rk.vy += rk.g * dt;
        addParticle({
          x: rk.x, y: rk.y, vx: rand(-0.2, 0.2), vy: rand(0.2, 0.6), drag: 0.95, g: 0.01,
          decay: rand(0.04, 0.07), size: 1.1 * unit, color: [255, 200, 120],
        });
        ctx.strokeStyle = "rgba(255,236,190,0.95)";
        ctx.lineWidth = 2 * unit;
        ctx.beginPath();
        ctx.moveTo(rk.px, rk.py);
        ctx.lineTo(rk.x, rk.y);
        ctx.stroke();
        if (rk.vy >= -0.35 * unit) {
          rockets.splice(i, 1);
          explode(rk);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i -= 1) {
        const fl = flashes[i];
        fl.life -= 0.06 * dt;
        if (fl.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        drawGlow(fl.x, fl.y, fl.r * (1.2 - fl.life * 0.4), fl.c, 0.28 * fl.life);
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;
        const drag = p.drag ** dt;
        p.vx *= drag;
        p.vy *= drag;
        p.vy += p.g * dt;
        p.x += p.vx * dt + (p.ember ? Math.sin(now * 0.003 + p.phase) * 0.25 : 0);
        p.y += p.vy * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          if (p.crackle) crackle(p);
          particles.splice(i, 1);
          continue;
        }
        let a = Math.min(1, p.life * 1.4);
        if (p.flicker && Math.random() < 0.35) a *= 0.2;
        if (p.ember) a *= 0.8;
        ctx.strokeStyle = rgba(p.color, a);
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x + 0.01, p.y + 0.01);
        ctx.stroke();
        if (p.glow && p.life > 0.55) {
          ctx.fillStyle = rgba(p.color, 0.18 * a);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !visible || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function localPoint(e) {
      const rect = host.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    let lastSparkle = 0;
    function onPointerMove(e) {
      if (e.pointerType !== "mouse" || !running) return;
      const now = performance.now();
      if (now - lastSparkle < 28) return;
      lastSparkle = now;
      const { x, y } = localPoint(e);
      sparkleAt(x, y, 2);
    }

    function onPointerDown(e) {
      if (!running) return;
      const { x, y } = localPoint(e);
      sparkleAt(x, y, 10, 2);
      if (y < h * 0.6) launch({ x, y: Math.max(16 * unit, y) });
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(host);
    document.addEventListener("visibilitychange", onVisibility);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerdown", onPointerDown);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="mpf-diwali-fx" aria-hidden="true" />;
}
