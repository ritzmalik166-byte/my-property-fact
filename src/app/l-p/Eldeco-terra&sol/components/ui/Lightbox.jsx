"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { startPageScroll, stopPageScroll } from "../motion/lenisStore";
import styles from "./Lightbox.module.css";

const SWIPE_THRESHOLD = 50; // px of drag needed to change photo

/**
 * Full-screen photo slider for the gallery.
 * Photos sit side by side on one track that glides (eased transform) to the active slide.
 * Controls: arrows, ← → keys, swipe / drag, dots; Esc or backdrop closes.
 */
export default function Lightbox({ items, index, onChange, onClose }) {
  const open = index !== null && index !== undefined;
  const count = items.length;
  const go = useCallback((step) => onChange((index + step + count) % count), [index, count, onChange]);

  const [drag, setDrag] = useState(0); // live drag offset in px
  const dragRef = useRef(null); // { startX, pointerId }

  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    stopPageScroll();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      startPageScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go, onClose]);

  if (!open) return null;

  /* swipe / drag */
  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = { startX: e.clientX, pointerId: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    setDrag(e.clientX - dragRef.current.startX);
  };
  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (drag <= -SWIPE_THRESHOLD) go(1);
    else if (drag >= SWIPE_THRESHOLD) go(-1);
    setDrag(0);
  };

  const dragging = drag !== 0;
  const item = items[index];

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Photo gallery" onClick={onClose}>
      <figure className={styles.figure} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.frame}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className={`${styles.track} ${dragging ? styles.dragging : ""}`}
            style={{ transform: `translate3d(calc(${-index * 100}% + ${drag}px), 0, 0)` }}
          >
            {items.map((photo, i) => {
              const near = Math.abs(i - index) <= 1 || Math.abs(i - index) === count - 1;
              return (
                <div key={photo.alt} className={styles.slide} aria-hidden={i !== index}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 1100px"
                    className={styles.image}
                    priority={near} // current + neighbours load eagerly → no blank slide mid-glide
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <figcaption className={styles.caption} aria-live="polite">
          <span key={index} className={styles.captionText}>
            {item.alt} · {index + 1} / {count}
          </span>
          <span className={styles.note}>Artistic Impression</span>
        </figcaption>

        <div className={styles.dots}>
          {items.map((photo, i) => (
            <button
              key={photo.alt}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => onChange(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      </figure>

      <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={(e) => (e.stopPropagation(), go(-1))} aria-label="Previous photo">
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <path d="M13.5 5L7.5 11l6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className={`${styles.nav} ${styles.next}`} onClick={(e) => (e.stopPropagation(), go(1))} aria-label="Next photo">
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <path d="M8.5 5l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close gallery">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
