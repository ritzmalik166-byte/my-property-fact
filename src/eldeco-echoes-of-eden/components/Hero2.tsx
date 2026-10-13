import { getImageProps } from "next/image";
import { sectionsConfig } from "@/eldeco-echoes-of-eden/config/sections";

const BANNER_ALT = "Eldeco Echoes of Eden - Navratri Festive Offer";

export const Hero2 = () => {
  const common = { alt: BANNER_ALT, sizes: "100vw", priority: true };

  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...common,
    src: "/eldeco-echoes-of-eden/navratri/navratri_fest_eoe_desktop.jpg",
    width: 1280,
    height: 669,
  });

  const {
    props: { srcSet: tablet },
  } = getImageProps({
    ...common,
    src: "/eldeco-echoes-of-eden/navratri/navratri_fest_eoe_tab.jpg",
    width: 1280,
    height: 1280,
  });

  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    src: "/eldeco-echoes-of-eden/navratri/navratri_fest_eoe_tab.jpg",
    width: 768,
    height: 1024,
  });

  return (
    <section
      id={sectionsConfig.hero.id}
      className="scroll-mt-20 w-full overflow-hidden"
      aria-label="Project hero"
    >
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktop} width={1280} height={669} />
        <source media="(min-width: 768px)" srcSet={tablet} width={1280} height={1280} />
        <img {...rest} srcSet={mobile} alt={BANNER_ALT} className="block h-auto w-full" />
      </picture>
    </section>
  );
};
