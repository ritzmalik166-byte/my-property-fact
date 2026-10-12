"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Dropdown,
  Table,
  Badge
} from "react-bootstrap";
import { 
  cilChart, 
  cilViewModule, 
  cilPhone, 
  cilHome, 
  cilStar,
  cilArrowCircleTop,
  cilArrowCircleBottom,
  cilCalendar,
  cilFilter
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const analyticsData = {
    overview: {
      totalViews: 1250,
      viewsChange: 12.5,
      inquiries: 45,
      inquiriesChange: -3.2,
      conversions: 12,
      conversionsChange: 8.7,
      revenue: 125000,
      revenueChange: 15.3
    },
    topProperties: [
      {
        id: 1,
        title: "Luxury 3BHK Apartment",
        location: "Sector 45, Gurgaon",
        views: 245,
        inquiries: 12,
        conversionRate: 4.9,
        status: "active"
      },
      {
        id: 2,
        title: "Modern Villa with Garden",
        location: "Golf Course Road",
        views: 189,
        inquiries: 8,
        conversionRate: 4.2,
        status: "active"
      },
      {
        id: 3,
        title: "2BHK Ready to Move",
        location: "DLF Phase 2",
        views: 156,
        inquiries: 15,
        conversionRate: 9.6,
        status: "sold"
      }
    ],
    performanceMetrics: [
      {
        name: "Average Response Time",
        value: "2.3 min",
        change: -15.2,
        trend: "up"
      },
      {
        name: "Lead Quality Score",
        value: "8.4/10",
        change: 5.6,
        trend: "up"
      },
      {
        name: "Listing Quality",
        value: "78%",
        change: 3.2,
        trend: "up"
      },
      {
        name: "Client Satisfaction",
        value: "4.8/5",
        change: 2.1,
        trend: "up"
      }
    ]
  };

  const StatCard = ({ title, value, change, trend, icon, color }) => (
    <Card className="analytics-stat-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="stat-icon-wrapper">
            <CIcon icon={icon} className={`stat-icon text-${color}`} />
          </div>
          <div className={`stat-change text-${trend === 'up' ? 'success' : 'danger'}`}>
            {trend === 'up' ? <CIcon icon={cilArrowCircleTop} /> : <CIcon icon={cilArrowCircleBottom} />}
            <span className="ms-1">{Math.abs(change)}%</span>
          </div>
        </div>
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </Card.Body>
    </Card>
  );

  const MetricCard = ({ metric }) => (
    <Card className="metric-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="metric-name">{metric.name}</h6>
            <h4 className="metric-value">{metric.value}</h4>
          </div>
          <div className={`metric-change text-${metric.trend === 'up' ? 'success' : 'danger'}`}>
            {metric.trend === 'up' ? <CIcon icon={cilArrowCircleTop} /> : <CIcon icon={cilArrowCircleBottom} />}
            <span className="ms-1">{Math.abs(metric.change)}%</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Analytics Dashboard</h2>
            <p>Track your property performance and business metrics</p>
          </div>
          <div className="header-controls">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="me-2">
                <CIcon icon={cilFilter} className="me-1" />
                {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 90 days"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setTimeRange("7d")}>Last 7 days</Dropdown.Item>
                <Dropdown.Item onClick={() => setTimeRange("30d")}>Last 30 days</Dropdown.Item>
                <Dropdown.Item onClick={() => setTimeRange("90d")}>Last 90 days</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="primary">
              <CIcon icon={cilCalendar} className="me-1" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <StatCard
            title="Total Views"
            value={analyticsData.overview.totalViews.toLocaleString()}
            change={analyticsData.overview.viewsChange}
            trend="up"
            icon={cilViewModule}
            color="primary"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            title="Inquiries"
            value={analyticsData.overview.inquiries}
            change={analyticsData.overview.inquiriesChange}
            trend="down"
            icon={cilPhone}
            color="info"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            title="Conversions"
            value={analyticsData.overview.conversions}
            change={analyticsData.overview.conversionsChange}
            trend="up"
            icon={cilHome}
            color="success"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            title="Revenue"
            value={`₹${(analyticsData.overview.revenue / 100000).toFixed(1)}L`}
            change={analyticsData.overview.revenueChange}
            trend="up"
            icon={cilStar}
            color="warning"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Performance Metrics */}
        <Col lg={8}>
          <Card className="analytics-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Performance Metrics</h5>
              <Badge bg="success">Excellent</Badge>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {analyticsData.performanceMetrics.map((metric, index) => (
                  <Col md={6} key={index}>
                    <MetricCard metric={metric} />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Top Properties Performance */}
          <Card className="analytics-card mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Performing Properties</h5>
              <Button variant="outline-primary" size="sm">View All</Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Views</th>
                    <th>Inquiries</th>
                    <th>Conversion Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topProperties.map(property => (
                    <tr key={property.id}>
                      <td>
                        <div>
                          <h6 className="mb-1">{property.title}</h6>
                          <small className="text-muted">{property.location}</small>
                        </div>
                      </td>
                      <td>{property.views}</td>
                      <td>{property.inquiries}</td>
                      <td>
                        <Badge bg="success">{property.conversionRate}%</Badge>
                      </td>
                      <td>
                        <Badge bg={property.status === 'active' ? 'success' : 'warning'}>
                          {property.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Quick Insights */}
          <Card className="analytics-card">
            <Card.Header>
              <h6 className="mb-0">Quick Insights</h6>
            </Card.Header>
            <Card.Body>
              <div className="insights-list">
                <div className="insight-item">
                  <div className="insight-icon">
                    <CIcon icon={cilArrowCircleTop} className="text-success" />
                  </div>
                  <div className="insight-content">
                    <h6>Views Increased</h6>
                    <p>Your property views increased by 12.5% this month</p>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon">
                    <CIcon icon={cilPhone} className="text-info" />
                  </div>
                  <div className="insight-content">
                    <h6>Response Time</h6>
                    <p>Average response time improved to 2.3 minutes</p>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon">
                    <CIcon icon={cilStar} className="text-warning" />
                  </div>
                  <div className="insight-content">
                    <h6>High Conversion</h6>
                    <p>DLF Phase 2 property has 9.6% conversion rate</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Goals */}
          <Card className="analytics-card mt-4">
            <Card.Header>
              <h6 className="mb-0">Monthly Goals</h6>
            </Card.Header>
            <Card.Body>
              <div className="goals-list">
                <div className="goal-item">
                  <div className="goal-info">
                    <h6>Property Views</h6>
                    <small>Target: 2000 views</small>
                  </div>
                  <div className="goal-progress">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: '62.5%' }}
                      ></div>
                    </div>
                    <small className="text-muted">1250/2000</small>
                  </div>
                </div>
                <div className="goal-item">
                  <div className="goal-info">
                    <h6>Inquiries</h6>
                    <small>Target: 60 inquiries</small>
                  </div>
                  <div className="goal-progress">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    <small className="text-muted">45/60</small>
                  </div>
                </div>
                <div className="goal-item">
                  <div className="goal-info">
                    <h6>Revenue</h6>
                    <small>Target: ₹2L revenue</small>
                  </div>
                  <div className="goal-progress">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: '62.5%' }}
                      ></div>
                    </div>
                    <small className="text-muted">₹1.25L/₹2L</small>
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
        
        .header-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: rgba(102, 126, 234, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-change {
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .stat-value {
          font-size: 2rem;
          margin: 0.5rem 0;
        }

        .metric-card {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .metric-name {
          color: #6c757d;
          font-size: 0.875rem;
          margin: 0 0 0.5rem;
        }

        .metric-value {
          color: #212529;
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0;
        }

        .metric-change {
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .insight-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(102, 126, 234, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .insight-content h6 {
          margin: 0 0 0.25rem;
          font-weight: 600;
          color: #212529;
        }

        .insight-content p {
          margin: 0;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .goal-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .goal-info h6 {
          margin: 0 0 0.25rem;
          font-weight: 600;
          color: #212529;
        }

        .goal-info small {
          color: #6c757d;
        }

        .goal-progress {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
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

        @media (max-width: 1200px) {
          .analytics-page {
            padding: 1.5rem;
          }

          .header-title h2 {
            font-size: 1.75rem;
          }

          .stat-value {
            font-size: 1.75rem;
          }

          .metric-value {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 992px) {
          .analytics-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .header-controls {
            width: 100%;
            justify-content: stretch;
          }

          .header-controls .btn {
            flex: 1;
          }

          .header-title h2 {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .stat-icon-wrapper {
            width: 45px;
            height: 45px;
          }

          .stat-icon {
            font-size: 1.25rem;
          }

          .metric-value {
            font-size: 1.1rem;
          }

          /* Common table styles are in PortalCommonStyles.css */

          .insight-item {
            padding: 0.75rem;
          }

          .goal-item {
            gap: 0.75rem;
          }
        }

        @media (max-width: 768px) {
          .stat-value {
            font-size: 1.25rem;
          }

          .stat-title {
            font-size: 0.8rem;
          }

          .stat-icon-wrapper {
            width: 40px;
            height: 40px;
          }

          .stat-icon {
            font-size: 1.1rem;
          }

          .metric-value {
            font-size: 1rem;
          }

          .metric-name {
            font-size: 0.8rem;
          }

          /* Common table styles are in PortalCommonStyles.css */

          .insight-item {
            padding: 0.5rem;
            gap: 0.75rem;
          }

          .insight-icon {
            width: 35px;
            height: 35px;
          }

          .insight-content h6 {
            font-size: 0.9rem;
          }

          .insight-content p {
            font-size: 0.8rem;
          }

          .goal-item {
            gap: 0.5rem;
          }

          .goal-info h6 {
            font-size: 0.9rem;
          }

          .goal-info small {
            font-size: 0.75rem;
          }

          .analytics-card .card-header {
            padding: 1rem;
          }

          .analytics-card .card-body {
            padding: 1rem;
          }
        }

        @media (max-width: 576px) {
          .analytics-page {
            padding: 0.5rem;
          }

          .header-title h2 {
            font-size: 1.1rem;
          }

          .header-title p {
            font-size: 0.9rem;
          }

          .stat-value {
            font-size: 1.1rem;
          }

          .stat-title {
            font-size: 0.75rem;
          }

          .stat-icon-wrapper {
            width: 35px;
            height: 35px;
            margin-right: 0.5rem;
          }

          .stat-icon {
            font-size: 1rem;
          }

          .metric-value {
            font-size: 0.9rem;
          }

          .metric-name {
            font-size: 0.75rem;
          }

          .table {
            font-size: 0.75rem;
          }

          .table th,
          .table td {
            padding: 0.4rem 0.2rem;
          }

          .insight-item {
            padding: 0.75rem;
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .insight-icon {
            align-self: center;
          }

          .insight-content h6 {
            font-size: 0.85rem;
          }

          .insight-content p {
            font-size: 0.75rem;
          }

          .goal-item {
            gap: 0.4rem;
          }

          .goal-info h6 {
            font-size: 0.85rem;
          }

          .goal-info small {
            font-size: 0.7rem;
          }

          .analytics-card .card-header {
            padding: 0.75rem;
          }

          .analytics-card .card-body {
            padding: 0.75rem;
          }

          .header-controls .btn {
            font-size: 0.875rem;
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
