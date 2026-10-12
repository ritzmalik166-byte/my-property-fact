"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Form, 
  ProgressBar,
  Alert,
  Table
} from "react-bootstrap";
import { 
  cilStar, 
  cilCheck, 
  cilSettings, 
  cilChart,
  cilReload,
  cilSave,
  cilInfo
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function LeadScoringPage() {
  const [scoringCriteria, setScoringCriteria] = useState({
    budget: { weight: 25, enabled: true },
    timeline: { weight: 20, enabled: true },
    engagement: { weight: 15, enabled: true },
    source: { weight: 10, enabled: true },
    propertyType: { weight: 15, enabled: true },
    location: { weight: 10, enabled: true },
    previousExperience: { weight: 5, enabled: false }
  });

  const [scoringRules, setScoringRules] = useState([
    {
      id: 1,
      criteria: "Budget",
      condition: "Above ₹2 Cr",
      points: 25,
      description: "High budget indicates serious buyer"
    },
    {
      id: 2,
      criteria: "Budget",
      condition: "₹1 Cr - ₹2 Cr",
      points: 20,
      description: "Good budget range"
    },
    {
      id: 3,
      criteria: "Budget",
      condition: "Below ₹1 Cr",
      points: 10,
      description: "Lower budget range"
    },
    {
      id: 4,
      criteria: "Timeline",
      condition: "Ready to buy in 1 month",
      points: 25,
      description: "Immediate buyer"
    },
    {
      id: 5,
      criteria: "Timeline",
      condition: "Ready to buy in 3 months",
      points: 15,
      description: "Near-term buyer"
    },
    {
      id: 6,
      criteria: "Timeline",
      condition: "Just exploring",
      points: 5,
      description: "Long-term prospect"
    },
    {
      id: 7,
      criteria: "Engagement",
      condition: "Multiple property visits",
      points: 20,
      description: "High engagement level"
    },
    {
      id: 8,
      criteria: "Engagement",
      condition: "Regular communication",
      points: 15,
      description: "Good engagement"
    },
    {
      id: 9,
      criteria: "Engagement",
      condition: "Minimal interaction",
      points: 5,
      description: "Low engagement"
    }
  ]);

  const [sampleLeads] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      budget: "₹2.5 Cr",
      timeline: "Ready to buy in 1 month",
      engagement: "Multiple property visits",
      source: "Website",
      propertyType: "3 BHK Villa",
      location: "Gurgaon",
      calculatedScore: 85,
      status: "Hot"
    },
    {
      id: 2,
      name: "Priya Sharma",
      budget: "₹1.8 Cr",
      timeline: "Ready to buy in 3 months",
      engagement: "Regular communication",
      source: "Referral",
      propertyType: "2 BHK Apartment",
      location: "Delhi",
      calculatedScore: 72,
      status: "Warm"
    },
    {
      id: 3,
      name: "Amit Patel",
      budget: "₹85 L",
      timeline: "Just exploring",
      engagement: "Minimal interaction",
      source: "Social Media",
      propertyType: "1 BHK Studio",
      location: "Noida",
      calculatedScore: 45,
      status: "Cold"
    }
  ]);

  const handleWeightChange = (criteria, newWeight) => {
    setScoringCriteria(prev => ({
      ...prev,
      [criteria]: { ...prev[criteria], weight: newWeight }
    }));
  };

  const handleCriteriaToggle = (criteria) => {
    setScoringCriteria(prev => ({
      ...prev,
      [criteria]: { ...prev[criteria], enabled: !prev[criteria].enabled }
    }));
  };

  const getStatusBadge = (score) => {
    if (score >= 80) return { variant: "danger", text: "Hot" };
    if (score >= 60) return { variant: "warning", text: "Warm" };
    return { variant: "secondary", text: "Cold" };
  };

  const totalWeight = Object.values(scoringCriteria)
    .filter(c => c.enabled)
    .reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="scoring-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Lead Scoring System</h2>
            <p>Configure and manage your lead scoring criteria</p>
          </div>
          <div className="header-actions">
            <Button variant="outline-light" className="me-2">
              <CIcon icon={cilReload} className="me-1" />
              Recalculate All
            </Button>
            <Button variant="light">
              <CIcon icon={cilSave} className="me-1" />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Weight Distribution Alert */}
      <Alert variant={totalWeight === 100 ? "success" : "warning"} className="mb-4">
        <CIcon icon={cilInfo} className="me-2" />
        Total weight: {totalWeight}% 
        {totalWeight !== 100 && " (Should equal 100%)"}
      </Alert>

      <Row className="g-4">
        {/* Scoring Criteria Configuration */}
        <Col lg={8}>
          <Card className="scoring-config-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilSettings} className="me-2" />
                Scoring Criteria Configuration
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                {Object.entries(scoringCriteria).map(([key, criteria]) => (
                  <Col md={6} key={key}>
                    <div className="criteria-item">
                      <div className="criteria-header">
                        <div className="criteria-info">
                          <h6 className="criteria-name">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
                          <small className="criteria-description">
                            {criteria.enabled ? `${criteria.weight}% weight` : 'Disabled'}
                          </small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={criteria.enabled}
                          onChange={() => handleCriteriaToggle(key)}
                        />
                      </div>
                      
                      {criteria.enabled && (
                        <div className="criteria-controls">
                          <div className="weight-control">
                            <Form.Label>Weight: {criteria.weight}%</Form.Label>
                            <Form.Range
                              min="0"
                              max="50"
                              value={criteria.weight}
                              onChange={(e) => handleWeightChange(key, parseInt(e.target.value))}
                              className="custom-range"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Scoring Rules */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilStar} className="me-2" />
                Scoring Rules
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Criteria</th>
                      <th>Condition</th>
                      <th>Points</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoringRules.map(rule => (
                      <tr key={rule.id}>
                        <td>
                          <Badge bg="primary">{rule.criteria}</Badge>
                        </td>
                        <td>{rule.condition}</td>
                        <td>
                          <span className="points-badge">{rule.points}</span>
                        </td>
                        <td>
                          <small className="text-muted">{rule.description}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sample Lead Scores */}
        <Col lg={4}>
          <Card className="sample-scores-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilChart} className="me-2" />
                Sample Lead Scores
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="sample-leads">
                {sampleLeads.map(lead => {
                  const status = getStatusBadge(lead.calculatedScore);
                  return (
                    <div key={lead.id} className="sample-lead-item">
                      <div className="lead-header">
                        <h6 className="lead-name">{lead.name}</h6>
                        <Badge bg={status.variant}>{status.text}</Badge>
                      </div>
                      
                      <div className="score-display">
                        <div className="score-number">{lead.calculatedScore}</div>
                        <ProgressBar 
                          now={lead.calculatedScore} 
                          variant={status.variant}
                          className="score-progress"
                        />
                      </div>
                      
                      <div className="lead-details">
                        <div className="detail-item">
                          <strong>Budget:</strong> {lead.budget}
                        </div>
                        <div className="detail-item">
                          <strong>Timeline:</strong> {lead.timeline}
                        </div>
                        <div className="detail-item">
                          <strong>Engagement:</strong> {lead.engagement}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-stats">
                <div className="stat-item">
                  <div className="stat-label">Total Rules</div>
                  <div className="stat-value">{scoringRules.length}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Active Criteria</div>
                  <div className="stat-value">
                    {Object.values(scoringCriteria).filter(c => c.enabled).length}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg. Lead Score</div>
                  <div className="stat-value">
                    {Math.round(sampleLeads.reduce((sum, l) => sum + l.calculatedScore, 0) / sampleLeads.length)}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */

        .criteria-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e9ecef;
        }

        .criteria-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .criteria-name {
          margin: 0;
          font-weight: 600;
          color: #495057;
        }

        .criteria-description {
          color: #6c757d;
        }

        .weight-control {
          margin-top: 1rem;
        }

        .weight-control label {
          font-weight: 500;
          color: #495057;
        }

        .custom-range {
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
        }

        .custom-range::-webkit-slider-thumb {
          background: #667eea;
          border: none;
          border-radius: 50%;
          width: 18px;
          height: 18px;
        }

        .points-badge {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .sample-lead-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #e9ecef;
        }

        .lead-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .lead-name {
          margin: 0;
          font-weight: 600;
          color: #495057;
        }

        .score-display {
          margin-bottom: 0.75rem;
        }

        .score-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #495057;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .score-progress {
          height: 8px;
          border-radius: 4px;
        }

        .lead-details {
          font-size: 0.875rem;
        }

        .detail-item {
          margin-bottom: 0.25rem;
          color: #6c757d;
        }

        .quick-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .stat-label {
          font-weight: 500;
          color: #6c757d;
        }

        .stat-value {
          font-weight: 700;
          font-size: 1.25rem;
          color: #495057;
        }

        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
          font-size: 0.875rem;
        }

        .table td {
          vertical-align: middle;
          border-top: 1px solid #e9ecef;
        }

        @media (max-width: 768px) {
          .scoring-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .criteria-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .lead-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
