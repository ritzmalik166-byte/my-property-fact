"use client";
import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Alert,
  ListGroup,
} from "react-bootstrap";
import {
  cilEnvelopeOpen,
  cilPhone,
  cilChatBubble,
  cilClock,
  cilUser,
  cilStar,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    priority: "medium",
    category: "general",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const supportMethods = [
    {
      icon: cilEnvelopeOpen,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      responseTime: "Within 24 hours",
      availability: "24/7",
      action: "support@propertyportal.com",
    },
    {
      icon: cilPhone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      responseTime: "Immediate",
      availability: "Mon-Fri 9AM-6PM",
      action: "+91 98765 43210",
    },
    // {
    //   icon: cilChatBubble,
    //   title: "Live Chat",
    //   description: "Chat with our support team in real-time",
    //   responseTime: "Immediate",
    //   availability: "Mon-Fri 9AM-6PM",
    //   action: "Start Chat"
    // }
  ];

  return (
    <div className="contact-support-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Contact Support</h2>
            <p>Get in touch with our support team for assistance</p>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* Contact Methods */}
        <Col lg={4}>
          <Card className="contact-methods-card mb-4">
            <Card.Header>
              <h5 className="mb-0">Support Options</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {supportMethods.map((method, index) => (
                  <ListGroup.Item key={index} className="support-method-item">
                    <div className="support-method">
                      <div className="method-icon">
                        <CIcon icon={method.icon} />
                      </div>
                      <div className="method-info">
                        <h6 className="method-title">{method.title}</h6>
                        <p className="method-description">
                          {method.description}
                        </p>
                        <div className="method-details">
                          <small className="text-muted">
                            <CIcon icon={cilClock} className="me-1" />
                            {method.responseTime}
                          </small>
                          <small className="text-muted ms-3">
                            Available: {method.availability}
                          </small>
                        </div>
                      </div>
                      <div className="method-action">
                        <Button
                          variant={
                            method.icon === cilChatBubble
                              ? "primary"
                              : "outline-primary"
                          }
                          size="sm"
                          className="w-100"
                        >
                          {method.action}
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Quick Tips */}
          {/* <Card className="quick-tips-card">
            <Card.Header>
              <h5 className="mb-0">Quick Tips</h5>
            </Card.Header>
            <Card.Body>
              <ul className="tips-list">
                <li>Check our knowledge base first</li>
                <li>Include specific error messages</li>
                <li>Describe steps to reproduce issues</li>
                <li>Attach relevant screenshots</li>
                <li>Provide your account details</li>
              </ul>
            </Card.Body>
          </Card> */}
        </Col>

        {/* Contact Form */}
        <Col lg={8}>
          <Card className="contact-form-card">
            <Card.Header>
              <h5 className="mb-0">Send us a Message</h5>
            </Card.Header>
            <Card.Body>
              {submitted ? (
                <Alert variant="success">
                  <CIcon icon={cilStar} className="me-2" />
                  <strong>Message Sent!</strong> We&apos;ll get back to you
                  within 24 hours.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Name *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Subject *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.subject}
                          onChange={(e) =>
                            handleInputChange("subject", e.target.value)
                          }
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                          value={formData.priority}
                          onChange={(e) =>
                            handleInputChange("priority", e.target.value)
                          }
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange("category", e.target.value)
                          }
                        >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Issue</option>
                          <option value="billing">Billing Question</option>
                          <option value="feature">Feature Request</option>
                          <option value="bug">Bug Report</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Message *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          value={formData.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                          placeholder="Please describe your issue or question in detail..."
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilEnvelopeOpen} className="me-1" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */
        .contact-support-page {
          padding: 1.5rem;
        }
        .support-method-item {
          border: none;
          padding: 1.5rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .support-method-item:last-child {
          border-bottom: none;
        }

        .support-method {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .method-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          background: var(--portal-primary);
          flex-shrink: 0;
        }

        .method-info {
          flex: 1;
          min-width: 0;
        }

        .method-title {
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
          word-wrap: break-word;
        }

        .method-description {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
          word-wrap: break-word;
        }

        .method-details {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .method-action {
          flex-shrink: 0;
          width: 100%;
        }

        .method-action button {
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tips-list {
          margin: 0;
          padding-left: 1.5rem;
          color: #495057;
        }

        .tips-list li {
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }

        @media (max-width: 992px) {
          .support-method {
            flex-direction: column;
            align-items: flex-start;
          }

          .method-action {
            width: 100%;
            margin-top: 0.5rem;
          }

          .method-action button {
            width: 100%;
          }

          .method-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            width: 100%;
          }

          .method-details small {
            margin-left: 0 !important;
          }
        }

        @media (max-width: 768px) {
          .contact-support-page {
            padding: 1rem;
          }

          .page-header {
            padding: 1.5rem;
          }

          .header-title h2 {
            font-size: 1.5rem;
          }

          .header-title p {
            font-size: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .support-method-item {
            padding: 1rem 0;
          }

          .method-icon {
            width: 45px;
            height: 45px;
            font-size: 1.25rem;
          }

          .method-title {
            font-size: 1rem;
          }

          .method-description {
            font-size: 0.85rem;
          }

          .method-details {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 576px) {
          .contact-support-page {
            padding: 0.75rem;
          }

          .page-header {
            padding: 1rem;
            margin-bottom: 1rem;
          }

          .header-title h2 {
            font-size: 1.25rem;
          }

          .header-title p {
            font-size: 0.9rem;
          }

          .support-method-item {
            padding: 0.75rem 0;
          }

          .method-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
