import React from 'react'
import Script from 'next/script'
import S1 from './components/S1'
import S2 from './components/S2'
import S3 from './components/S3'
import S4 from './components/S4'
import S5 from './components/S5'
import S6 from './components/S6'
import S7 from './components/S7'
import S8 from './components/S8'
import S9 from './components/S9'
import ResForm from './components/ResForm'
import NewS2 from './components/NewS2'

// Metadata for SEO
export const metadata = {
  title: "Dholera Smart City - Premium Real Estate Investment | My Property Fact",
  description: "Explore Dholera Smart City - India's first greenfield smart city. Discover premium residential and commercial properties, investment opportunities, and future-ready infrastructure in Dholera. Get expert insights, price lists, and property details.",
  keywords: [
    "Dholera Smart City",
    "Dholera properties",
    "Dholera real estate",
    "Dholera investment",
    "smart city Dholera",
    "Dholera residential projects",
    "Dholera commercial properties",
    "Dholera plots",
    "Dholera flats",
    "Dholera villas"
  ],
  openGraph: {
    title: "Dholera Smart City - Premium Real Estate Investment",
    description: "Explore Dholera Smart City - India's first greenfield smart city. Discover premium residential and commercial properties.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dholera Smart City - Premium Real Estate Investment",
    description: "Explore Dholera Smart City - India's first greenfield smart city.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_ROOT_URL || 'https://www.mypropertyfact.in'}/landing-pages/dholera`,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

function page() {
  return (
    <>
        <S1 />
        <ResForm />
        {/* <S2 /> */}
        <NewS2 />
        <S3 />
        <S4 />
        <S5 />
        <S6 />
        <S7 />
        <S8 />
        <S9 />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17708520580"
          strategy="afterInteractive"
        />
        <Script id="gtag-dholera" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-17708520580');
          `}
        </Script>
    </>
  )
}

export default page