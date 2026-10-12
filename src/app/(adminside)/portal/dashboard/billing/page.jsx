"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  ProgressBar,
  Table,
  Alert,
  ListGroup
} from "react-bootstrap";
import { 
  cilCreditCard, 
  cilDollar, 
  cilChart, 
  cilCheck,
  cilWarning,
  cilInfo,
  cilCloudDownload,
  cilViewModule,
  cilSettings
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function BillingPage() {
  const [currentPlan] = useState({
    name: "Professional Plan",
    price: 2999,
    currency: "INR",
    period: "month",
    features: [
      "Up to 50 active listings",
      "Unlimited lead management",
      "Advanced analytics",
      "Email support",
      "Mobile app access"
    ],
    usage: {
      listings: 32,
      maxListings: 50,
      leads: 1247,
      maxLeads: "unlimited"
    }
  });

  const [invoices] = useState([
    {
      id: "INV-001",
      date: "2024-01-01",
      amount: 2999,
      status: "paid",
      dueDate: "2024-01-31",
      items: ["Professional Plan - January 2024"]
    },
    {
      id: "INV-002", 
      date: "2023-12-01",
      amount: 2999,
      status: "paid",
      dueDate: "2023-12-31",
      items: ["Professional Plan - December 2023"]
    },
    {
      id: "INV-003",
      date: "2023-11-01", 
      amount: 2999,
      status: "paid",
      dueDate: "2023-11-30",
      items: ["Professional Plan - November 2023"]
    }
  ]);

  const [paymentMethods] = useState([
    {
      id: 1,
      type: "credit_card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 2,
      type: "credit_card", 
      last4: "5555",
      brand: "Mastercard",
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ]);

  const getStatusBadge = (status) => {
    const variants = {
      "paid": "success",
      "pending": "warning", 
      "overdue": "danger",
      "failed": "danger"
    };
    return variants[status] || "secondary";
  };

  const getUsagePercentage = () => {
    return Math.round((currentPlan.usage.listings / currentPlan.usage.maxListings) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "danger";
    if (percentage >= 75) return "warning";
    return "success";
  };

  return (
    <div className="billing-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Billing & Subscription</h2>
            <p>Manage your subscription, payments, and billing information</p>
          </div>
          <div className="header-actions">
            <Button variant="primary" className="me-2">
              <CIcon icon={cilCreditCard} className="me-1" />
              Add Payment Method
            </Button>
            <Button variant="outline-light">
              <CIcon icon={cilSettings} className="me-1" />
              Billing Settings
            </Button>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* Current Plan */}
        <Col lg={8}>
          <Card className="plan-card mb-4">
            <Card.Header>
              <h5 className="mb-0">Current Plan</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                <Col md={6}>
                  <div className="plan-info">
                    <h3 className="plan-name">{currentPlan.name}</h3>
                    <div className="plan-price">
                      <span className="currency">{currentPlan.currency}</span>
                      <span className="amount">{currentPlan.price.toLocaleString()}</span>
                      <span className="period">/{currentPlan.period}</span>
                    </div>
                    <div className="plan-features">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <CIcon icon={cilCheck} className="feature-icon" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="usage-section">
                    <h6>Usage This Month</h6>
                    <div className="usage-item">
                      <div className="usage-header">
                        <span>Active Listings</span>
                        <span>{currentPlan.usage.listings}/{currentPlan.usage.maxListings}</span>
                      </div>
                      <ProgressBar 
                        variant={getUsageColor(getUsagePercentage())}
                        now={getUsagePercentage()}
                        className="mb-3"
                      />
                    </div>
                    <div className="usage-item">
                      <div className="usage-header">
                        <span>Leads Managed</span>
                        <span>{currentPlan.usage.leads.toLocaleString()} (unlimited)</span>
                      </div>
                    </div>
                    
                    <Alert variant={getUsageColor(getUsagePercentage())} className="mt-3">
                      <CIcon icon={getUsagePercentage() >= 90 ? cilWarning : cilInfo} className="me-2" />
                      {getUsagePercentage() >= 90 
                        ? "You're close to your listing limit. Consider upgrading your plan."
                        : "Your usage is within normal limits."
                      }
                    </Alert>
                  </div>
                </Col>
              </Row>
              
              <div className="plan-actions mt-4">
                <Button variant="outline-primary" className="me-2">
                  <CIcon icon={cilChart} className="me-1" />
                  View Usage Details
                </Button>
                <Button variant="primary">
                  <CIcon icon={cilSettings} className="me-1" />
                  Upgrade Plan
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Invoices */}
          <Card className="invoices-card">
            <Card.Header>
              <h5 className="mb-0">Recent Invoices</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td>
                          <div className="invoice-info">
                            <div className="invoice-id">{invoice.id}</div>
                            <small className="invoice-items">{invoice.items.join(", ")}</small>
                          </div>
                        </td>
                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                        <td>
                          <div className="invoice-amount">
                            {invoice.currency} {invoice.amount.toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td>
                          <div className="invoice-actions">
                            <Button variant="outline-primary" size="sm" className="me-1">
                              <CIcon icon={cilViewModule} />
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              <CIcon icon={cilCloudDownload} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Payment Methods */}
          <Card className="payment-methods-card mb-4">
            <Card.Header>
              <h5 className="mb-0">Payment Methods</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {paymentMethods.map(method => (
                  <ListGroup.Item key={method.id} className="payment-method-item">
                    <div className="payment-method">
                      <div className="method-info">
                        <div className="method-brand">
                          <CIcon icon={cilCreditCard} className="me-2" />
                          {method.brand} •••• {method.last4}
                        </div>
                        <small className="method-expiry">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </small>
                      </div>
                      <div className="method-actions">
                        {method.isDefault && (
                          <Badge bg="primary" className="me-2">Default</Badge>
                        )}
                        <Button variant="outline-secondary" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              
              <Button variant="outline-primary" className="w-100 mt-3">
                <CIcon icon={cilCreditCard} className="me-1" />
                Add New Payment Method
              </Button>
            </Card.Body>
          </Card>

          {/* Billing Summary */}
          <Card className="billing-summary-card mb-4">
            <Card.Header>
              <h5 className="mb-0">Billing Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="summary-items">
                <div className="summary-item">
                  <span>Current Plan</span>
                  <span className="summary-value">{currentPlan.name}</span>
                </div>
                <div className="summary-item">
                  <span>Monthly Cost</span>
                  <span className="summary-value">{currentPlan.currency} {currentPlan.price.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span>Next Billing Date</span>
                  <span className="summary-value">February 1, 2024</span>
                </div>
                <div className="summary-item">
                  <span>Payment Method</span>
                  <span className="summary-value">Visa •••• 4242</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="quick-actions-card">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-actions">
                <Button variant="outline-primary" className="w-100 mb-2">
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  Download Invoice
                </Button>
                <Button variant="outline-secondary" className="w-100 mb-2">
                  <CIcon icon={cilCreditCard} className="me-1" />
                  Update Payment Method
                </Button>
                <Button variant="outline-info" className="w-100 mb-2">
                  <CIcon icon={cilInfo} className="me-1" />
                  Billing History
                </Button>
                <Button variant="outline-warning" className="w-100">
                  <CIcon icon={cilSettings} className="me-1" />
                  Change Plan
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */

        .plan-name {
          color: #495057;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          margin-bottom: 2rem;
        }

        .currency {
          font-size: 1.25rem;
          color: #6c757d;
          margin-right: 0.5rem;
        }

        .amount {
          font-size: 3rem;
          font-weight: 700;
          color: #667eea;
          margin-right: 0.5rem;
        }

        .period {
          font-size: 1.25rem;
          color: #6c757d;
        }

        .plan-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .feature-icon {
          color: #28a745;
          font-size: 1.1rem;
        }

        .usage-section h6 {
          color: #495057;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .usage-item {
          margin-bottom: 1.5rem;
        }

        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .plan-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .invoice-info {
          display: flex;
          flex-direction: column;
        }

        .invoice-id {
          font-weight: 600;
          color: #495057;
        }

        .invoice-items {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .invoice-amount {
          font-weight: 600;
          color: #495057;
        }

        .invoice-actions {
          display: flex;
          gap: 0.25rem;
        }

        .payment-method-item {
          border: none;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .payment-method {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .method-brand {
          font-weight: 600;
          color: #495057;
        }

        .method-expiry {
          color: #6c757d;
        }

        .method-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-value {
          font-weight: 600;
          color: #495057;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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
          .billing-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .plan-price {
            flex-direction: column;
            align-items: flex-start;
          }

          .plan-actions {
            flex-direction: column;
          }

          .payment-method {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
