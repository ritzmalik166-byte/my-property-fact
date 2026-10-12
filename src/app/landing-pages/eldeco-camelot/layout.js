import "bootstrap/dist/css/bootstrap.min.css";
import "./css/style.css";
import Script from "next/script";

export const metadata = {
    title: "Eldeco Camelot",
    description: "Eldeco Camelot Landing Page",
};

export default function RootLayout({ children }) {
    return (
        <>
            <Script
                src="https://code.jquery.com/jquery-3.6.0.min.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/owl.carousel@2.3.4/dist/owl.carousel.min.js"
                strategy="afterInteractive"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
                strategy="afterInteractive"
            />
            <main>{children}</main>
        </>
    );
}
