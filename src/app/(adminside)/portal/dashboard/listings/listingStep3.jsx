// -------------------------------
// Step 3: Pricing & Floor Details

import { useEffect, useMemo, useState } from "react";
import {
  CheckGroup,
  NumberInput,
  Section,
  SelectInput,
  TextInput,
} from "./commonFunction";
import { Col, Row } from "react-bootstrap";

// -------------------------------
export default function ListingStep3({ data, setField }) {
  const [activeField, setActiveField] = useState(null);
  const taxOptions = useMemo(
    () =>
      ["GST", "Registration", "Stamp", "Club", "Parking", "PLC"].map((x) => ({
        label: x,
        value: x,
      })),
    []
  );

  // Wrap setField to also set active field
  const handleChange = (name, value) => {
    setActiveField(name);
    setField(name, value);
  };

  useEffect(() => {
    if (data.builtUpArea > 0) {
      if (activeField === "totalPrice" && data.totalPrice > 0) {
        const pricePerSqft = calculatePricePerSqft(
          data.totalPrice,
          data.builtUpArea
        );
        if (data.pricePerSqft !== pricePerSqft) {
          setField("pricePerSqft", pricePerSqft);
        }
      } else if (activeField === "pricePerSqft" && data.pricePerSqft > 0) {
        const totalPrice = calculateTotalPrice(
          data.pricePerSqft,
          data.builtUpArea
        );
        if (data.totalPrice !== totalPrice) {
          setField("totalPrice", totalPrice);
        }
      }
    }
  }, [data.totalPrice, data.pricePerSqft, data.builtUpArea, activeField]);
    


  const calculatePricePerSqft = (totalPrice, area) =>
    totalPrice > 0 && area > 0 ? Math.round(totalPrice / area) : 0;

  const calculateTotalPrice = (pricePerSqft, area) =>
    pricePerSqft > 0 && area > 0 ? Math.round(pricePerSqft * area) : 0;

  return (
    <>
      <Section title="Pricing">
        <Row>
          <Col md={6}>
            <NumberInput
              label="Total price (₹)"
              name="totalPrice"
              value={data.totalPrice}
              onChange={handleChange}
              min={0}
              step={1000}
            />
          </Col>
          <Col md={6}>
            <NumberInput
              label="Price / sq ft (₹)"
              name="pricePerSqft"
              value={data.pricePerSqft}
              onChange={handleChange}
              min={0}
              step={10}
            />
          </Col>
        </Row>
        <CheckGroup
          label="Taxes & charges"
          name="taxesCharges"
          options={taxOptions}
          values={data.taxesCharges || []}
          onChange={setField}
        />
        <Row>
          <Col md={6}>
            <NumberInput
              label="Maintenance / CAM (₹/mo or ₹/sq ft/mo)"
              name="maintenanceCam"
              value={data.maintenanceCam}
              onChange={setField}
              min={0}
              step={10}
            />
          </Col>
          <Col md={6}>
            <SelectInput
              label="Water supply"
              name="waterSupply"
              value={data.waterSupply}
              onChange={setField}
              options={["Municipal", "Borewell", "Mixed"]}
            />
          </Col>
        </Row>
      </Section>

      <Section title="Floor / Block & Parking">
        <Row>
          {(data.subType !== "Villa" && data.subType !== "Plot") && (
            <Col md={4}>
              <TextInput
                label="Tower / Block"
                name="towerBlock"
                value={data.towerBlock}
                onChange={setField}
              />
            </Col>
          )}
          {(data.subType !== "Villa" && data.subType !== "Plot") && (
            <Col md={4}>
              <NumberInput
                label="Floor no."
                name="floorNo"
                value={data.floorNo}
                onChange={setField}
                min={0}
                step={1}
              />
            </Col>
          )}
          {data.subType !== "Plot" && (
            <Col md={4}>
              <NumberInput
                label="Total floors"
                name="totalFloors"
                value={data.totalFloors}
                onChange={setField}
                min={0}
                step={1}
              />
            </Col>
          )}
        </Row>
        <Row>
          <Col md={6}>
            <NumberInput
              label="Parking slots (car)"
              name="carParkingSlots"
              value={data.carParkingSlots}
              onChange={setField}
              min={0}
              step={1}
            />
          </Col>
          <Col md={6}>
            <NumberInput
              label="Parking slots (bike)"
              name="bikeParkingSlots"
              value={data.bikeParkingSlots}
              onChange={setField}
              min={0}
              step={1}
            />
          </Col>
        </Row>
        <SelectInput
          label="Parking type"
          name="parkingType"
          value={data.parkingType}
          onChange={setField}
          options={["Covered", "Open", "Stack"]}
        />
        <SelectInput
          label="Power backup"
          name="powerBackup"
          value={data.powerBackup}
          onChange={setField}
          options={["None", "Partial", "Full"]}
        />
      </Section>
    </>
  );
}
