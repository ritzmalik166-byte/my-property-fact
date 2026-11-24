"use client";

import Image from "next/image";
import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Lightbox from "../ui/Lightbox";
import { useEnquiry } from "../enquiry/EnquiryContext";
import { icons, images } from "../../assets";
import { SECTION_IDS } from "../../data/content";
import styles from "./GalleryCard.module.css";

/* thumbnail order follows the Figma layers: g2, g1, g3, g5 */
const THUMBS = [
  { src: images.gallery2, alt: "Eldeco Terra & Sol towers" },
  { src: images.gallery1, alt: "Landscaped entrance and wrapped balconies" },
  { src: images.gallery3, alt: "Infinity pool at sunset" },
  { src: images.gallery5, alt: "Podium greens and clubhouse" },
];
/* footage of the dummy "video": blurred and slowly drifting (served from /public) */
const VIDEO_POSTER = "/eld-imgs/s9/s9-i3.jpg";

const ALL_PHOTOS = [
  { src: images.videoThumbnail, alt: "Aerial view of Eldeco Terra & Sol" },
  ...THUMBS,
  { src: images.amenityPool, alt: "All weather infinity pool" },
];

/** Card / Gallery & Video — desktop 23:310, mobile 23:776. */
export default function GalleryCard() {
  const [index, setIndex] = useState(null);
  const { openEnquiry } = useEnquiry();
  const playVideo = () =>
    openEnquiry({
      title: "Watch the Project Video",
      submitLabel: "Watch Video",
      source: "Gallery — Play video",
    });

  return (
    <Card
      id={SECTION_IDS.gallery}
      title="Gallery & Video"
      headerRight={
        <Button variant="outline" size="sm" className={`${styles.seeAll} ${styles.seeAllTop}`} onClick={() => setIndex(0)}>
          See All Photos
        </Button>
      }
    >
      {/* 23:314 — dummy blurred "video" (s9-i3.jpg, drifting) + play button → enquiry form */}
      <button type="button" className={styles.video} onClick={playVideo} aria-label="Play project video">
        <span className={styles.frames} aria-hidden="true">
          <Image
            src={VIDEO_POSTER}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 714px"
            className={styles.frame}
          />
        </span>
        <span className={styles.overlay} />
        <span className={styles.chip}>Artistic Impression</span>
        <span className={styles.play}>
          <Icon src={icons.play29} size={29} className="ets-d" />
          <Icon src={icons.play22} size={22} className="ets-m" />
        </span>
      </button>

      <ul className={styles.thumbs}>
        {THUMBS.map((thumb, i) => (
          <li key={thumb.alt}>
            <button type="button" className={styles.thumb} onClick={() => setIndex(i + 1)} aria-label={`Open photo: ${thumb.alt}`}>
              <Image src={thumb.src} alt={thumb.alt} fill sizes="(max-width: 767px) 25vw, 170px" />
            </button>
          </li>
        ))}
      </ul>

      <Button variant="outline" full className={`${styles.seeAll} ${styles.seeAllBottom}`} onClick={() => setIndex(0)}>
        See All Photos
      </Button>

      <Lightbox items={ALL_PHOTOS} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
    </Card>
  );
}
