"use client";
import { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import {
  Section,
  SelectInput,
  TextInput,
} from "./commonFunction";
import { fetchProjectStatus, fetchProjectTypes } from "@/app/_global_components/masterFunction";

export default function ListingStep1({ data, setField, errors }) {
  const [propertyType, setPropertyType] = useState([]);
  const [propertyStauts, setPropertyStauts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const propertyTypes = await fetchProjectTypes();
        setPropertyType(propertyTypes.data || propertyTypes || []);
        const propertyStatus = await fetchProjectStatus();
        setPropertyStauts(propertyStatus.data || propertyStatus || []);
      } catch (error) {
        console.error("Error loading property data:", error);
      }
    };
    loadData();
  }, []);
  
  return (
    <>
      <Section title="Listing Basics">
        <Row>
          <Col md={6}>
            <SelectInput
              label="Listing Type"
              name="listingType"
              value={data.listingType}
              onChange={setField}
              options={propertyType.map(type => type.projectTypeName)}
            />
          </Col>
          <Col md={6}>
            <SelectInput
              label="Transaction"
              name="transaction"
              value={data.transaction}
              onChange={setField}
              options={["Sale", "Rent/Lease"]}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <SelectInput
              label="Sub-Type"
              name="subType"
              value={data.subType}
              onChange={setField}
              options={
                data.listingType === "Residential"
                  ? [
                      "Apartment",
                      "Villa",
                      "Plot",
                      "Studio",
                      "Penthouse",
                      "Farmhouse",
                      "Serviced Apartment",
                      "Independent House",
                      "Independent Floor",
                      "Duplex",
                      "Triplex",
                    ]
                  : [
                      "Office",
                      "Retail",
                      "Warehouse",
                      "Industrial",
                      "Land",
                      "Hotel/Resort",
                      "Co-working Space",
                      "Showroom",
                    ]
              }
            />
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={data.description ?? ""}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="300–1,200 chars; avoid phone/email in body"
          />
        </Form.Group>
      </Section>

      <Section title="Property Status">
        <Row>
          <Col md={6}>
            <SelectInput
              label="Ready / Under-Construction"
              name="status"
              value={data.status}
              onChange={setField}
              options={propertyStauts.map(status => status.statusName)}
            />
          </Col>
          {data.status === "Under-Construction" && (
            <Col md={6}>
              <TextInput
                label="Possession (Q1–Q4 YYYY or date)"
                name="possession"
                value={data.possession}
                onChange={setField}
                placeholder="e.g., Q4 2026 or 2025-12-01"
              />
            </Col>
          )}
        </Row>
        <SelectInput
          label="Occupancy"
          name="occupancy"
          value={data.occupancy}
          onChange={setField}
          options={["Vacant", "Self-occupied", "Tenanted"]}
        />
        {data.occupancy === "Tenanted" && (
          <TextInput
            label="Notice period (days)"
            name="noticePeriod"
            value={data.noticePeriod}
            onChange={setField}
          />
        )}
      </Section>
    </>
  );
}
