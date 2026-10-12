"use client";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import { useState, useMemo, useEffect } from "react";
import styles from './page.module.css';
import { PieChart } from '@mui/x-charts';
import { Form } from 'react-bootstrap';
import { 
  FaChartLine, 
  FaCity, 
  FaBuilding, 
  FaRoad, 
  FaShoppingBag, 
  FaArrowUp,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaAward,
  FaMapMarkerAlt
} from 'react-icons/fa';

export default function LocateScore({ cities, locateScoreData }) {
  const [cityDetail, setCityDetail] = useState(null);
  const [cityName, setCityName] = useState("");
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-select first city on mount
  useEffect(() => {
    if (cities && cities.length > 0 && locateScoreData && !cityDetail) {
      const firstCity = cities[0];
      const detail = locateScoreData.find((item) => item.id === firstCity.id);
      if (detail) {
        setCityDetail(detail);
        setCityName(firstCity.cityName);
        setSelectedCityId(firstCity.id);
      }
    }
  }, [cities, locateScoreData]);

  const getCityDetails = (city) => {
    const detail = locateScoreData.find((item) => item.id === city.id);
    if (detail) {
      setCityDetail(detail);
      setCityName(city.cityName);
      setSelectedCityId(city.id);
    }
  };

  // Helper function to get score color - using project theme
  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return '#226401'; // dark green
    if (percentage >= 70) return '#68ac78'; // medium green
    if (percentage >= 50) return '#cfab5a'; // golden
    return '#dc2626'; // red
  };

  // Helper function to get score class
  const getScoreClass = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'average';
    return 'poor';
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!cityDetail?.categories) return null;
    
    return {
      barChart: {
        data: cityDetail.categories.map(cat => ({
          category: cat.code,
          score: cat.score,
          maxScore: cat.maxScore,
          percentage: (cat.score / cat.maxScore) * 100
        }))
      },
      pieChart: {
        data: cityDetail.categories.map((cat, index) => ({
          id: index,
          value: cat.score,
          label: `${cat.code} - ${cat.name}`,
          color: getScoreColor(cat.score, cat.maxScore)
        }))
      }
    };
  }, [cityDetail]);

  // Get category icon
  const getCategoryIcon = (code) => {
    const icons = {
      'L': <FaChartLine />,
      'O': <FaBuilding />,
      'C': <FaRoad />,
      'A': <FaShoppingBag />,
      'T': <FaArrowUp />,
      'E': <FaCity />
    };
    return icons[code] || <FaMapMarkerAlt />;
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      <CommonHeaderBanner headerText={"LOCATE Score"} />
      
      <div className="container my-4 my-md-5" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Enhanced Header Section */}
        {/* <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>LOCATE SCORE</div>
            <div className={styles.heroTitle}>LOCATE Score Analysis</div>
            <div className={styles.heroSubtitle}>Comprehensive real estate investment evaluation framework</div>
          </div>
        </div> */}
        <div className="container text-center">
          <p>The LOCATE Score is My Property Fact&apos;s proprietary 1000-point framework that evaluates any location using six critical factors: Local Economy, Ongoing Projects, Connectivity, Amenities, Trends, and Existing Supply-Demand. It helps buyers and investors compare cities and micro-markets objectively, understand long-term growth potential, and make smarter, data-driven real-estate decisions with clarity and confidence.</p>
        </div>

        {/* City Selection */}
        {/* Mobile Dropdown */}
        <div className={`d-block d-md-none my-4 ${styles.mobileDropdownContainer}`}>
          <Form.Select
            value={selectedCityId || ''}
            onChange={(e) => {
              const selectedCity = cities.find(city => city.id === parseInt(e.target.value));
              if (selectedCity) {
                getCityDetails(selectedCity);
              }
            }}
            className={styles.mobileDropdown}
          >
            <option value="">Select a City</option>
            {cities.map((city, index) => (
              <option key={index} value={city.id}>
                {city.cityName}
              </option>
            ))}
          </Form.Select>
        </div>

        {/* Desktop Buttons */}
        <div className="d-none d-md-flex flex-wrap gap-2 gap-md-3 justify-content-center my-4 my-md-5" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          {cities.map((city, index) => (
            <button
              key={index}
              onClick={() => getCityDetails(city)}
              className={`${styles.localityButton} ${selectedCityId === city.id ? styles.active : ''}`}
            >
              <FaCity style={{ marginRight: '0.5rem', fontSize: '0.9rem' }} />
              {city.cityName}
            </button>
          ))}
        </div>

        {cityDetail && (
          <>
            {/* City Header Card */}
            <div className={styles.cityHeader}>
              <div className="row align-items-center g-3">
                <div className="col-12 col-md-8">
                  <h2 className="h2 h3-md fw-bold mb-2 mb-md-3">
                    <FaMapMarkerAlt style={{ marginRight: '0.75rem', fontSize: '1.25rem' }} />
                    {cityName}
                  </h2>
                  <p className="mb-2 fs-6 fs-md-5">
                    <strong>Focus:</strong> {cityDetail.focus || "Commercial Real Estate Investment"}
                  </p>
                  {cityDetail.evaluationDate && (
                    <p className="mb-0 opacity-75 small">
                      <strong>Evaluation Date:</strong> {new Date(cityDetail.evaluationDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
                <div className="col-12 col-md-4 text-center text-md-end">
                  {cityDetail.summary && (
                    <div>
                      <div className={styles.gradeBadge}>
                        Grade {cityDetail.summary.grade}
                      </div>
                      <p className="mt-2 mb-0 fw-bold">{cityDetail.summary.gradeLabel}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            {cityDetail.summary && (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {cityDetail.summary.totalScore}
                  </div>
                  <div className={styles.statLabel}>Total Score</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {cityDetail.summary.maxTotalScore}
                  </div>
                  <div className={styles.statLabel}>Maximum Score</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {Math.round((cityDetail.summary.totalScore / cityDetail.summary.maxTotalScore) * 100)}%
                  </div>
                  <div className={styles.statLabel}>Performance</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue} style={{ fontSize: '2rem' }}>
                    {cityDetail.summary.grade}
                  </div>
                  <div className={styles.statLabel}>Investment Grade</div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            {chartData && (
              <div className="row my-4 my-md-5 g-3 g-md-4">
                <div className="col-12 col-md-6">
                  <div className={styles.chartContainer}>
                    <h3 className="mb-3 mb-md-4 fw-bold h5 h4-md">
                      <FaChartLine style={{ marginRight: '0.5rem', color: '#226401' }} />
                      Category Scores Comparison
                    </h3>
                    <div style={{ width: '100%', padding: '1rem', maxWidth: '100%', overflowX: 'auto' }}>
                      {chartData.barChart.data.map((item, index) => {
                        const scorePercentage = (item.score / item.maxScore) * 100;
                        const maxPercentage = 100;
                        return (
                          <div key={index} style={{ marginBottom: '2rem' }}>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="fw-bold">{item.category}</span>
                              <span className="text-muted">{item.score}/{item.maxScore}</span>
                            </div>
                            <div style={{ position: 'relative', height: '40px', background: '#e5e7eb', borderRadius: '20px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  width: `${maxPercentage}%`,
                                  height: '100%',
                                  background: '#e5e7eb',
                                  borderRadius: '20px'
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  width: `${scorePercentage}%`,
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${getScoreColor(item.score, item.maxScore)} 0%, ${getScoreColor(item.score, item.maxScore)}dd 100%)`,
                                  borderRadius: '20px',
                                  transition: 'width 1s ease-in-out',
                                  display: 'flex',
                                  alignItems: 'center',
                                  paddingLeft: '1rem',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {scorePercentage >= 15 && `${Math.round(scorePercentage)}%`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className={styles.chartContainer}>
                    <h3 className="mb-3 mb-md-4 fw-bold h5 h4-md">
                      <FaArrowUp style={{ marginRight: '0.5rem', color: '#226401' }} />
                      Score Distribution
                    </h3>
                    <div style={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                      {isMounted && chartData && (
                        <PieChart
                          series={[{
                            data: chartData.pieChart.data,
                            innerRadius: 60,
                            outerRadius: 120,
                            paddingAngle: 2,
                            cornerRadius: 5
                          }]}
                          width={400}
                          height={400}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Score Summary Card */}
            {cityDetail.summary && (
              <div className={styles.summaryCard}>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="display-6 fw-bold mb-3">
                      Final LOCATE Score
                    </h2>
                    <div className="d-flex align-items-center mb-3">
                      <span className="display-4 fw-bold me-3">
                        {cityDetail.summary.totalScore}/{cityDetail.summary.maxTotalScore}
                      </span>
                      <div className={styles.progressContainer} style={{ flex: 1 }}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{
                              width: `${(cityDetail.summary.totalScore / cityDetail.summary.maxTotalScore) * 100}%`,
                              background: `linear-gradient(90deg, ${getScoreColor(cityDetail.summary.totalScore, cityDetail.summary.maxTotalScore)} 0%, ${getScoreColor(cityDetail.summary.totalScore, cityDetail.summary.maxTotalScore)}dd 100%)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {cityDetail.summary.headlineVerdict && (
                      <p className="fs-5 mb-0 opacity-90">
                        {cityDetail.summary.headlineVerdict}
                      </p>
                    )}
                  </div>
                  <div className="col-md-4 text-center">
                    <FaAward style={{ fontSize: '5rem', opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="my-4 my-md-5">
              <h2 className="mb-3 mb-md-4 fw-bold h3 h2-md">
                <FaChartLine style={{ marginRight: '0.5rem', color: '#226401' }} />
                Category Breakdown
              </h2>
              <div className={styles.categoryGrid}>
                {cityDetail.categories?.map((category, index) => {
                  const percentage = (category.score / category.maxScore) * 100;
                  const scoreColor = getScoreColor(category.score, category.maxScore);
                  const scoreClass = getScoreClass(category.score, category.maxScore);
                  const circumference = 2 * Math.PI * 36; // radius = 36
                  const offset = circumference - (percentage / 100) * circumference;
                  
                  return (
                    <div key={index} className={`${styles.scoreCard} ${styles[scoreClass]}`}>
                      {/* Card Header */}
                      <div className={styles.scoreCardHeader}>
                        <div className="d-flex align-items-start gap-3">
                          <div className={styles.iconWrapper} style={{ background: scoreColor + '15', color: scoreColor }}>
                            {getCategoryIcon(category.code)}
                          </div>
                          <div className={styles.categoryHeaderContent}>
                            <h3 className={styles.categoryTitle}>
                              {category.code} – {category.name}
                            </h3>
                            <p className={styles.categorySubtitle}>{category.maxScore} points maximum</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className={styles.scoreCardBody}>
                        {/* Score Display with Circular Progress */}
                        <div className={styles.scoreDisplay}>
                          <div className={styles.circularProgress}>
                            <svg width="80" height="80">
                              <circle
                                className={`${styles.circularProgressCircle} ${styles.circularProgressBg}`}
                                cx="40"
                                cy="40"
                                r="36"
                              />
                              <circle
                                className={styles.circularProgressCircle}
                                cx="40"
                                cy="40"
                                r="36"
                                stroke={scoreColor}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                              />
                            </svg>
                            <div className={styles.circularProgressValue}>
                              {Math.round(percentage)}%
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-muted" style={{ fontSize: '0.875rem' }}>Score</span>
                              <span className={styles.scoreBadge} style={{ background: scoreColor }}>
                                {category.score}/{category.maxScore}
                              </span>
                            </div>
                            <div className={styles.progressBar}>
                              <div 
                                className={styles.progressFill}
                                style={{
                                  width: `${percentage}%`,
                                  background: `linear-gradient(90deg, ${scoreColor} 0%, ${scoreColor}dd 100%)`
                                }}
                              />
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Performance: {percentage >= 85 ? 'Excellent' : percentage >= 70 ? 'Good' : percentage >= 50 ? 'Average' : 'Needs Improvement'}
                              </small>
                            </div>
                          </div>
                        </div>

                        {/* Sections */}
                        <div className="mt-4">
                          <h5 className="fw-bold mb-3" style={{ color: '#226401', fontSize: '1rem' }}>
                            Details
                          </h5>
                          {category.sections?.map((section, sectionIndex) => (
                            <div key={sectionIndex} className={styles.sectionCard}>
                              <h5 className={styles.sectionTitle}>{section.title}</h5>
                              <p className={styles.sectionBody}>
                                {section.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interpretation */}
            {cityDetail.interpretation && (
              <div className="my-4 my-md-5">
                <h2 className="mb-3 mb-md-4 fw-bold h3 h2-md">
                  <FaLightbulb style={{ marginRight: '0.5rem', color: '#226401' }} />
                  Interpretation & Outlook
                </h2>
                <div className="row g-3">
                  {cityDetail.interpretation.strengths && cityDetail.interpretation.strengths.length > 0 && (
                    <div className="col-12 col-md-6">
                      <div className={styles.interpretationCard + ' ' + styles.strengths}>
                        <h4 className="fw-bold mb-3">
                          <FaCheckCircle style={{ marginRight: '0.5rem', color: '#226401' }} />
                          Strengths
                        </h4>
                        <ul className="list-unstyled">
                          {cityDetail.interpretation.strengths.map((item, index) => (
                            <li key={index} className="my-2 d-flex align-items-start">
                              <FaCheckCircle className="me-2 mt-1" style={{ color: '#226401', flexShrink: 0 }} />
                              <span>{item}</span>
                            </li>
                  ))}
                </ul>
                      </div>
                    </div>
                  )}
                  {cityDetail.interpretation.watchOuts && cityDetail.interpretation.watchOuts.length > 0 && (
                    <div className="col-12 col-md-6">
                      <div className={styles.interpretationCard + ' ' + styles.watchOuts}>
                        <h4 className="fw-bold mb-3">
                          <FaExclamationTriangle style={{ marginRight: '0.5rem', color: '#cfab5a' }} />
                          Watch Outs
                  </h4>
                        <ul className="list-unstyled">
                          {cityDetail.interpretation.watchOuts.map((item, index) => (
                            <li key={index} className="my-2 d-flex align-items-start">
                              <FaExclamationTriangle className="me-2 mt-1" style={{ color: '#cfab5a', flexShrink: 0 }} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {cityDetail.recommendations && (
              <div className="my-4 my-md-5">
                <h2 className="mb-3 mb-md-4 fw-bold h3 h2-md">
                  <FaLightbulb style={{ marginRight: '0.5rem', color: '#226401' }} />
                  Recommendations for Investors
                </h2>
                <div className="row g-3">
                  {cityDetail.recommendations.microMarketStrategy && (
                    <div className="col-12 col-md-6">
                      <div className={styles.recommendationCard}>
                        <h4 className="fw-bold mb-3 h5">
                          <FaMapMarkerAlt style={{ marginRight: '0.5rem', color: '#226401' }} />
                          Micro Market Strategy
                        </h4>
                        <ul>
                          {cityDetail.recommendations.microMarketStrategy.map((item, index) => (
                            <li key={index} className="my-2">{item}</li>
                  ))}
                </ul>
                      </div>
                    </div>
                  )}
                  {cityDetail.recommendations.developerAndInfra && (
                    <div className="col-12 col-md-6">
                      <div className={styles.recommendationCard}>
                        <h4 className="fw-bold mb-3 h5">
                          <FaBuilding style={{ marginRight: '0.5rem', color: '#226401' }} />
                          Developer & Infrastructure
                        </h4>
                        <ul>
                          {cityDetail.recommendations.developerAndInfra.map((item, index) => (
                            <li key={index} className="my-2">{item}</li>
                          ))}
                        </ul>
              </div>
            </div>
                  )}
                  {cityDetail.recommendations.assetType && (
                    <div className="col-12 col-md-6">
                      <div className={styles.recommendationCard}>
                        <h4 className="fw-bold mb-3 h5">
                          <FaCity style={{ marginRight: '0.5rem', color: '#226401' }} />
                          Asset Type
                        </h4>
                        <ul>
                          {cityDetail.recommendations.assetType.map((item, index) => (
                            <li key={index} className="my-2">{item}</li>
                          ))}
              </ul>
            </div>
                    </div>
                  )}
                  {cityDetail.recommendations.holdingHorizon && (
                    <div className="col-12 col-md-6">
                      <div className={styles.recommendationCard}>
                        <h4 className="fw-bold mb-3 h5">
                          <FaArrowUp style={{ marginRight: '0.5rem', color: '#226401' }} />
                          Holding Horizon
                        </h4>
                        <p className="mb-0">{cityDetail.recommendations.holdingHorizon}</p>
                      </div>
                    </div>
                  )}
            </div>
              </div>
            )}

            {/* Verdict */}
            {cityDetail.verdictText && (
              <div className="my-4 my-md-5">
                <div className={styles.summaryCard}>
                  <h2 className="mb-3 fw-bold h3 h2-md">
                    <FaAward style={{ marginRight: '0.5rem' }} />
                    Final Verdict
                  </h2>
                  <p className="fs-6 fs-md-5 mb-0 opacity-90" style={{ lineHeight: '1.8' }}>
                    {cityDetail.verdictText}
                  </p>
                </div>
              </div>
            )}
          </>
      )}
      </div>
    </div>
  );
}
