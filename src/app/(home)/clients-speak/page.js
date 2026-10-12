import CommonBreadCrum from "../components/common/breadcrum";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
export default function ClientsSpeak() {
  return (
    <>
      <CommonHeaderBanner image={"clients-speak.jpg"} headerText={"Client's Speak"}/>
      <CommonBreadCrum pageName={"Client's speak"} />
      <p className="h3 fw-bold text-center my-5">Coming soon...</p>
    </>
  );
}
