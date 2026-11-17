import Script from "next/script";

const CONVERSION_ID = "AW-17892647835";
const CONVERSION_SEND_TO = "AW-17892647835/R2h7CIDYta0cEJvH8NNC";

export default function EldecoThankYouLayout({ children }) {
  return (
    <>
      <Script
        id="eldeco-thankyou-gtag-conversion"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
           window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('config', '${CONVERSION_ID}');
            gtag('event', 'conversion', { 'send_to': '${CONVERSION_SEND_TO}' });
          `,
        }}
      />
      {children}
    </>
  );
}
