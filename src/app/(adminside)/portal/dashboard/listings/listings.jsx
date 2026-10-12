"use client";
import { useState } from "react";
import { Form, Button, Nav, ProgressBar } from "react-bootstrap";
import ListingStep1 from "./listingStep1";
import ListingStep2 from "./listingStep2";
import ListingStep3 from "./listingStep3";
import { ListingStep4 } from "./listingStep4";
import { ListingStep5 } from "./listingStep5";

export default function Listing() {
  const steps = [
    { key: 1, title: "Listing Basics", Component: ListingStep1 },
    { key: 2, title: "Location & Area", Component: ListingStep2 },
    { key: 3, title: "Pricing & Floor Details", Component: ListingStep3 },
    { key: 4, title: "Property Features", Component: ListingStep4 },
    {
      key: 5,
      title: "Media, Compliance & Contact",
      Component: ListingStep5,
    },
  ];

  const [active, setActive] = useState(1);
  const [data, setData] = useState({
    // sensible defaults
    listingType: "",
    transaction: "",
    status: "",
    commercialSubType: "",
  });

  const setField = (name, value) => setData((d) => ({ ...d, [name]: value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // Basic validations per doc (extend as needed)
    const errs = {};
    if (!data.listingType) errs.listingType = "Select listing type";
    if (!data.transaction) errs.transaction = "Select transaction";
    if (!data.description || data.description.length < 50)
      errs.description = "Add 50–1200 chars";
    if (!data.carpetArea || Number(data.carpetArea) < 50)
      errs.carpetArea = "Carpet area ≥ 50 sq ft";
    if (!data.totalPrice || Number(data.totalPrice) < 50000)
      errs.totalPrice = "Price must be realistic";

    if (Object.keys(errs).length) {
      alert(
        "Please fix required fields: \n" +
          Object.entries(errs)
            .map(([k, v]) => `• ${k}: ${v}`)
            .join("\n")
      );
      return;
    }

    alert("Form submitted successfully!");
  };

  const ActiveComp = steps.find((s) => s.key === active)?.Component;

  return (
    <div className="container py-4">
      <h3 className="mb-4">Property Listing Form</h3>

      {/* Step tracker with direct navigation */}
      <Nav variant="tabs" activeKey={String(active)} className="mb-3 flex-wrap">
        {steps.map((s) => (
          <Nav.Item key={s.key}>
            <Nav.Link eventKey={String(s.key)} onClick={() => setActive(s.key)}>
              {s.title}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <ProgressBar now={(active / steps.length) * 100} className="mb-4" />

      <Form onSubmit={onSubmit}>
        {ActiveComp && <ActiveComp data={data} setField={setField} />}

        <div className="d-flex justify-content-between mt-3">
          <Button
            variant="secondary"
            disabled={active === 1}
            onClick={() => setActive((a) => Math.max(1, a - 1))}
          >
            Previous
          </Button>
          {active < steps.length ? (
            <Button
              variant="primary"
              onClick={() => setActive((a) => Math.min(steps.length, a + 1))}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" variant="success">
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
