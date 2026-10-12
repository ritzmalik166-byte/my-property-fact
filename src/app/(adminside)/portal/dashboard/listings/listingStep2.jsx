// -------------------------------
// Step 2: Location & Area

import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { NumberInput, Section, SelectInput, TextInput } from "./commonFunction";

// -------------------------------
export default function ListingStep2({ data, setField, errors }) {
    return (
        <>
      <Section title="Location">
        <Row>
          <Col md={6}>
            <TextInput
              label="Project/Building Name"
              name="projectName"
              value={data.projectName}
              onChange={setField}
            />
          </Col>
          <Col md={6}>
            {/* <TextInput
              label="Builder/Developer Name"
              name="builderName"
              value={data.builderName}
              onChange={setField}
            /> */}
            <SelectInput 
              label="Builder/Developer Name"
              name="builderName"
              value={data.builderName}
              onChange={setField}
              options={[]}
            />
          </Col>
        </Row>
        <TextInput
          label="Address lines + Landmark"
          name="address"
          value={data.address}
          onChange={setField}
        />
        <Row>
          <Col md={6}>
            <TextInput
              label="Locality / Area"
              name="locality"
              value={data.locality}
              onChange={setField}
            />
          </Col>
          <Col md={6}>
            <TextInput
              label="City / District / State"
              name="cityDistrictState"
              value={data.cityDistrictState}
              onChange={setField}
            />
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <TextInput
              label="PIN (6 digits)"
              name="pin"
              value={data.pin}
              onChange={setField}
            />
          </Col>
          {/* <Col md={8}>
            <InputGroup className="mb-3">
              <InputGroup.Text>Geo (lat, lng)</InputGroup.Text>
              <Form.Control
                placeholder="Latitude"
                value={data.lat ?? ""}
                onChange={(e) => setField("lat", e.target.value)}
              />
              <Form.Control
                placeholder="Longitude"
                value={data.lng ?? ""}
                onChange={(e) => setField("lng", e.target.value)}
              />
            </InputGroup>
          </Col> */}
        </Row>
      </Section>

      <Section title="Area">
        <Row>
          <Col md={6}>
            <NumberInput
              label="Carpet area (sq ft)"
              name="carpetArea"
              value={data.carpetArea}
              onChange={setField}
              min={50}
              step={1}
            />
          </Col>
          <Col md={6}>
            <NumberInput
              label="Built-up / SBA (sq ft)"
              name="builtUpArea"
              value={data.builtUpArea}
              onChange={setField}
              min={0}
              step={1}
            />
          </Col>
        </Row>
      </Section>
    </>
    );
}
