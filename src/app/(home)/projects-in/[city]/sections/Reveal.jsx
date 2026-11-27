"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades its content up once it scrolls into view, then disconnects its
 * observer. Animation styles live in sections.css (.ap-reveal).
 */
export default function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`ap-reveal${visible ? " is-visible" : ""} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
