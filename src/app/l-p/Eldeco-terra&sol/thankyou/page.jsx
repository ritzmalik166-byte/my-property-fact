"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ELDECO_LP_V6_BASE_PATH } from "@/components/eldecoPaths";
import { images } from "../assets";
import styles from "./thankyou.module.css";

/** Thank-you page for /l-p/Eldeco-terra&sol — redirects back after 5 seconds. */
export default function ThankYouPage() {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (secondsLeft === 0) {
      window.location.href = ELDECO_LP_V6_BASE_PATH;
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Image src={images.logo} alt="Eldeco Terra & Sol" className={styles.logo} priority />
        <span className={styles.tag}>ENQUIRY SUBMITTED</span>
        <h1 className={styles.title}>Thank you!</h1>
        <p className={styles.text}>
          Your enquiry for Eldeco Terra &amp; Sol has been received. Our property expert will call you shortly with the
          latest price list and offers.
        </p>
        <div className={styles.counter} aria-live="polite">
          {secondsLeft}
        </div>
        <p className={styles.small}>
          Returning to the project page in {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}.
        </p>
        <a href={ELDECO_LP_V6_BASE_PATH} className={`ets-water ${styles.button}`}>
          Back to Eldeco Terra &amp; Sol
        </a>
      </div>
    </main>
  );
}
