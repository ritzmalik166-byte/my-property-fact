/* eslint-disable @next/next/no-img-element */

/**
 * Figma-exported SVG icon. Keeps the SVG's intrinsic width/height
 * (passed through from the static import) unless `size` overrides it.
 */
export default function Icon({ src, size, className, alt = "" }) {
  if (!src) return null;
  const width = size ?? src.width;
  const height = size ?? src.height;
  return (
    <img
      src={src.src}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
      style={{ width, height, flexShrink: 0 }}
      loading="lazy"
      decoding="async"
    />
  );
}
