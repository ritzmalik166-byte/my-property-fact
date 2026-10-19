"use client";

import { useState } from "react";
import Image from "next/image";

export default function DreamCityIcon({ src, fallbackSrc, alt }) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      title={alt}
      width={72}
      height={72}
      sizes="72px"
      quality={75}
      loading="lazy"
      fetchPriority="low"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
