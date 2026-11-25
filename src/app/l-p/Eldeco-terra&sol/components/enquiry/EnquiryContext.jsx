"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import EnquiryModal from "./EnquiryModal";

const EnquiryContext = createContext({ openEnquiry: () => {} });

/** Lets any CTA on the page open the enquiry popup with its own heading. */
export function EnquiryProvider({ children }) {
  const [state, setState] = useState(null);

  const openEnquiry = useCallback((options = {}) => {
    setState({
      title: options.title ?? "Get Exclusive Price from Developer",
      submitLabel: options.submitLabel ?? "Get Exclusive Price",
      source: options.source ?? options.title ?? "Popup",
    });
  }, []);
  const close = useCallback(() => setState(null), []);
  const value = useMemo(() => ({ openEnquiry }), [openEnquiry]);

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      <EnquiryModal open={Boolean(state)} onClose={close} {...(state ?? {})} />
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  return useContext(EnquiryContext);
}
