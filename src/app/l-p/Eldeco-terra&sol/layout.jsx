import { Montserrat } from "next/font/google";
import "./styles/landing.css";

/* The v6 frames use Montserrat only (Regular / Medium / SemiBold / Bold). */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "Eldeco Terra & Sol | Luxury 3 & 3.5 BHK in Sector 80, Gurugram | ₹3.33 Cr*",
  description:
    "Eldeco Terra & Sol — iconic luxury 3 & 3.5 BHK apartments in Sector 80, Gurugram with only 4 homes per core, G+30 towers on 2.7 acres. Starting ₹3.33 Cr*. HARERA Reg. No. 20 of 2026. Get the latest price list and book a site visit.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffdf8",
};

export default function EldecoTerraSolLpLayout({ children }) {
  return <div className={`ets ${montserrat.variable}`}>{children}</div>;
}
