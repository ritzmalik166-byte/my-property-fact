"use client";

const ARROW_ICONS = {
  prev: { src: "/icon/arrow-left-s-line.svg", label: "Previous slide" },
  next: { src: "/icon/arrow-right-s-line.svg", label: "Next slide" },
};

/** Arrow button shared by the Slick slider and the mobile swipe rail. */
export function FeaturedArrowButton({ direction, className = "", style, onClick }) {
  const { src, label } = ARROW_ICONS[direction];
  return (
    <button
      type="button"
      className={`${className ? `${className} ` : ""}custom-featured-arrow custom-featured-arrow-${direction}`}
      style={style}
      onClick={onClick}
      aria-label={label}
    >
      {/* 32px static SVG — next/image would serve it unoptimized anyway */}
      <img src={src} alt={label} title={label} width={32} height={32} aria-hidden />
    </button>
  );
}

/** react-slick clones these and injects className/style/onClick. */
function SlickNextArrow({ className, style, onClick }) {
  return <FeaturedArrowButton direction="next" className={className} style={style} onClick={onClick} />;
}

function SlickPrevArrow({ className, style, onClick }) {
  return <FeaturedArrowButton direction="prev" className={className} style={style} onClick={onClick} />;
}

export const SLICK_NEXT_ARROW = <SlickNextArrow />;
export const SLICK_PREV_ARROW = <SlickPrevArrow />;
