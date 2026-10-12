const {
  ResidentialFields,
  CommercialFields,
  Section,
  TextInput,
  TextSelectableInput,
} = require("./commonFunction");

export function ListingStep4({ data, setField }) {
  return (
    <>
      {data.listingType === "Residential" && (
        <ResidentialFields data={data} setField={setField} />
      )}
      {data.listingType === "Commercial" && (
        <CommercialFields data={data} setField={setField} />
      )}

      <Section title="Nearby POIs & Distances">
        {/* <TextInput
          label="Points of Interest"
          name="pois"
          value={data.pois}
          onChange={setField}
          placeholder="Schools, hospitals, metro, malls, highways (comma-separated)"
        /> */}
        <TextSelectableInput
          label="Points of Interest"
          name="pois"
          value={data.pois}
          onChange={setField}
          options={[
            "School",
            "Hospital",
            "Metro Station",
            "Mall",
            "Highway",
            "Bus Stop",
            "Airport",
            "Train Station",
            "Park",
            "Restaurant",
            "Cafe",
            "Gym",
            "Pharmacy",
            "Grocery Store",
          ]}
          placeholder="Select or type points of interest"
        />
      </Section>
    </>
  );
}
