import Image from "next/image";
import Card from "../ui/Card";
import Icon from "../ui/Icon";
import EnquiryButton from "../enquiry/EnquiryButton";
import { icons, renders } from "../../assets";
import { FLOOR_PLANS, SECTION_IDS } from "../../data/content";
import styles from "./FloorPlansCard.module.css";

/** Card / Floor Plans — desktop 23:427 (3 locked plans), mobile 23:860 (swipe carousel). */
export default function FloorPlansCard() {
  return (
    <Card
      id={SECTION_IDS.floorPlans}
      title="Floor Plans"
      headerRight={<span className={`${styles.hint} ets-d`}>Unlock with your mobile number</span>}
    >
      <ul className={styles.plans}>
        {FLOOR_PLANS.map((name) => (
          <li key={name} className={styles.plan}>
            <div className={styles.locked}>
              <Image
                src={renders.floorplanBlurDesktop}
                alt=""
                fill
                sizes="(max-width: 767px) 220px, 228px"
                className={`${styles.blur} ets-d`}
              />
              <Image src={renders.floorplanBlurMobile} alt="" fill sizes="220px" className={`${styles.blur} ets-m`} />
              <span className={`${styles.lock} ets-d`}>
                <Icon src={icons.lockGold} size={20} />
              </span>
              <EnquiryButton
                size="sm"
                icon={icons.unlock}
                className={styles.unlock}
                title={`Unlock ${name} Floor Plan`}
                submitLabel="Unlock Floor Plan"
                source={`Unlock Plan — ${name}`}
              >
                Unlock Plan
              </EnquiryButton>
            </div>
            <h3 className={styles.name}>{name}</h3>
          </li>
        ))}
      </ul>
    </Card>
  );
}
