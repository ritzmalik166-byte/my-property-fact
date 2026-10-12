// -------------------------------
// Step 5: Media, Compliance & Contact

const { Col, Row, Form } = require("react-bootstrap");
const {
  Section,
  FileInput,
  SelectInput,
  TextInput,
} = require("./commonFunction");

// -------------------------------
export function ListingStep5({ data, setField }) {
  return (
    <>
      <Section title="Media">
        <FileInput
          label="Photos (min 8)"
          name="photos"
          onChange={setField}
          multiple
        />
        <FileInput
          label="Floor plan(s)"
          name="floorPlans"
          onChange={setField}
          multiple
        />
        <TextInput
          label="Video / Virtual Tour (URL)"
          name="videoUrl"
          value={data.videoUrl}
          onChange={setField}
        />
      </Section>

      <Section title="Legal & Compliance">
        <SelectInput
          label="Ownership type"
          name="ownershipType"
          value={data.ownershipType}
          onChange={setField}
          options={["Freehold", "Leasehold", "PoA", "Co-operative"]}
        />
        <Row>
          <Col md={6}>
            <TextInput
              label="RERA Project ID"
              name="reraId"
              value={data.reraId}
              onChange={setField}
            />
          </Col>
          <Col md={6}>
            <TextInput
              label="RERA State (for verify link)"
              name="reraState"
              value={data.reraState}
              onChange={setField}
            />
          </Col>
        </Row>
        {/* <Section title="Documents (Upload)">
          <FileInput
            label="Proof of ownership (Sale deed/Allotment/Conveyance)"
            name="docOwnershipProof"
            onChange={setField}
          />
          <FileInput
            label="Possession/Occupation Certificate (OC/CC)"
            name="docOccCert"
            onChange={setField}
          />
          <FileInput
            label="Latest property tax receipt"
            name="docTaxReceipt"
            onChange={setField}
          />
          <FileInput
            label="Society NOC (if required)"
            name="docSocietyNoc"
            onChange={setField}
          />
          <FileInput
            label="RERA Agent Registration (ID + state + validity)"
            name="docReraAgent"
            onChange={setField}
          />
          <FileInput
            label="Under-Construction: Builder NOC/Allotment letter"
            name="docBuilderNoc"
            onChange={setField}
          />
          <FileInput
            label="Commercial Lease: Last rent invoice / CAM schedule"
            name="docLeaseInvoiceCam"
            onChange={setField}
          />
        </Section> */}

        <Row>
          {/* <Col md={6}>
            <TextInput
              label="PAN last-4 (for billing)"
              name="panLast4"
              value={data.panLast4}
              onChange={setField}
            />
          </Col>
          <Col md={6}>
            <TextInput
              label="GSTIN (if billed)"
              name="gstin"
              value={data.gstin}
              onChange={setField}
            />
          </Col> */}
        </Row>
      </Section>

      <Section title="Contact & Consent">
        <SelectInput
          label="Contact preference"
          name="contactPreference"
          value={data.contactPreference}
          onChange={setField}
          options={["Call", "WhatsApp", "Email"]}
        />
        <Row>
          {data.contactPreference !== "Email" && (
            <Col md={6}>
              <TextInput
                label="Primary contact number"
                name="primaryContact"
                value={data.primaryContact}
                onChange={setField}
                type="tel"
                placeholder="+91 98765 43210"
                maxLength={13}
              />
            </Col>
          )}
          {data.contactPreference === "Email" && (
            <Col md={6}>
              <TextInput
                label="Primary Email Id"
                name="primaryEmail"
                value={data.primaryEmail}
                onChange={setField}
                type="email"
                placeholder="example@gmail.com"
              />
            </Col>
          )}
        </Row>
        <Form.Check
          className="mt-2"
          type="checkbox"
          label="I declare this listing is truthful"
          checked={!!data.truthfulDeclaration}
          onChange={(e) => setField("truthfulDeclaration", e.target.checked)}
        />
        <Form.Check
          className="mt-2"
          type="checkbox"
          label="I consent to contact & privacy (DPDP)"
          checked={!!data.dpdpConsent}
          onChange={(e) => setField("dpdpConsent", e.target.checked)}
        />
      </Section>
    </>
  );
}
