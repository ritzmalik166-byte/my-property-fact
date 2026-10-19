import Image from "next/image";
import Link from "next/link";
import "./dreamcity.css";

const CITY_CARD_SIZES = "300px";

//Cities json data
const cities = [
  {
    name: "Agra",
    link: "/city/agra",
    image: "/dream-cities/agra.jpg",
    alt: "Agra — find properties on My Property Fact"
  },
  {
    name: "Bangalore",
    link: "/city/bangalore",
    image: "/dream-cities/bangalore.jpg",
    alt: "Bangalore — find properties on My Property Fact"
  },
  {
    name: "Noida",
    link: "/city/noida",
    image: "/dream-cities/noida.jpg",
    alt: "Noida — find properties on My Property Fact"
  },
  {
    name: "Delhi",
    link: "/city/delhi",
    image: "/dream-cities/delhi.jpg",
    alt: "Delhi — find properties on My Property Fact"
  },
  {
    name: "Ghaziabad",
    link: "/city/ghaziabad",
    image: "/dream-cities/ghaziabad.jpg",
    alt: "Ghaziabad — find properties on My Property Fact"
  },
  {
    name: "Jaipur",
    link: "/city/jaipur",
    image: "/dream-cities/jaipur.jpg",
    alt: "Jaipur — find properties on My Property Fact"
  },
  {
    name: "Mumbai",
    link: "/city/mumbai",
    image: "/dream-cities/mumbai.jpg",
    alt: "Mumbai — find properties on My Property Fact"
  },
  {
    name: "Gurugram",
    link: "/city/gurugram",
    image: "/dream-cities/gurugram.jpg",
    alt: "Gurugram — find properties on My Property Fact"
  }
];

/** Front and back share one src/sizes so the browser fetches each city image once. */
function CityFlipImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      title={alt}
      width={300}
      height={180}
      sizes={CITY_CARD_SIZES}
      loading="lazy"
      className="img-fluid rounded shadow-sm"
    />
  );
}

export default function DreamProject() {
  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          {cities.map((city) => (
            <div key={city.name} className="col-12 col-sm-6 col-md-4 col-lg-3 py-3 d-flex justify-content-center">
              <div className="city-flip-container">
                <div className="city-flip-inner">
                  <div className="city-flip-front">
                    <Link
                      href={city.link}
                      prefetch={false}
                      title={city.alt}
                    >
                      <CityFlipImage src={city.image} alt={city.alt} />
                    </Link>
                  </div>
                  <div className="city-flip-back">
                    <Link
                      href={city.link}
                      prefetch={false}
                      title={`${city.name} real estate on My Property Fact`}
                    >
                      <CityFlipImage
                        src={city.image}
                        alt={`${city.name} — flip card back, find properties on My Property Fact`}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
