"use client";
import "./citydata.css";
import { useEffect, useState } from "react";
import PropertyRateAndTrendTable from "./propertyRateAndTrendTable";
export default function CityData({ insightData }) {
  const [defaultAggregationFrom, setDefaultAggregationFrom] = useState("1Yr");
  const [defaultCategory, setDefaultCategory] = useState("All");
  const [cityPriceList, setCityPriceList] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [activeCat, setActiveCat] = useState(0);
  const [activeIndex, setActiveIndex] = useState(2);

  // handling changing data of the table
  const getAggregationFromData = async (value, index) => {
    setDefaultAggregationFrom(value);
    fetchAllData(defaultCategory, value);
    setActiveIndex(index);
  }

  // handling changing data of the table according to category
  const getCategoryWiseData = async (value, index) => {
    setDefaultCategory(value);
    fetchAllData(value, defaultAggregationFrom);
    setActiveCat(index);
  }

  const fetchAllData = (category = 'All', aggregationFrom = '1Yr') => {
    if (category === 'NewSale') {
      category = 'New Sale';
    }
    const allData = insightData?.formattedData || [];
    const filteredData = allData.find(item => item.categoryDisplayName === category);
    const headers = filteredData?.headers;
    const aggregationData = filteredData?.aggregationFromList || [];
    const aggregationFilteredData = aggregationData?.find(item => item.aggregationFromDisplayName === aggregationFrom)?.details;
    setCityPriceList(aggregationFilteredData);
    setTableHeaders(headers);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <>
      <div className="insight-property-rate-filter">
        <div className="insight-property-rate-filter-child mb-3">
          {["All", "NewSale", "Resale"].map((item, index) => (
            <p
              key={`${item}-${index}`}
              className={`${activeCat === index
                ? "insight-property-rate-filter-child-active"
                : ""
                } cursor-pointer m-0`}
              onClick={() => getCategoryWiseData(item, index)}
            >
              {item}
            </p>
          ))}
        </div>
        <div className="insight-property-rate-filter-child mb-3">
          {["3M", "6M", "1Yr"].map((item, index) => (
            <p
              key={`${item}-${index}`}
              className={`${activeIndex === index
                ? "insight-property-rate-filter-child-active"
                : ""
                } cursor-pointer m-0`}
              onClick={() =>
                getAggregationFromData(item, index)
              }
            >
              {item}
            </p>
          ))}
        </div>
      </div>
      <PropertyRateAndTrendTable
        data={cityPriceList}
        tableHeaders={tableHeaders}
      />
    </>
  );
}
