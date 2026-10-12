"use client";

import CommonHeaderBanner from "../components/common/commonheaderbanner";

export default function BlogError() {
  return (
    <div>
      <CommonHeaderBanner headerText={"Blog"} />
      <div>
        <h3 className="text-center my-5 text-danger">
          Something went wrong while loading blogs please try again later !
        </h3>
      </div>
    </div>
  );
}
