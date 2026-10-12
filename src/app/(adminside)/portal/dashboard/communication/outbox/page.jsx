"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Form,
  Modal,
  Alert,
  Table,
  Dropdown,
  InputGroup,
  ListGroup,
  Tab,
  Tabs
} from "react-bootstrap";
import { 
  cilInbox, 
  cilSend, 
  cilViewModule, 
  cilTrash,
  cilReload,
  cilSearch,
  cilFilter,
  cilClock,
  cilCheck,
  cilX,
  cilWarning,
  cilInfo
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function OutboxPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      recipient: "Rajesh Kumar",
      recipientEmail: "rajesh.kumar@email.com",
      subject: "Thank you for your interest in our property",
      content: "Dear Rajesh,\n\nThank you for your interest in our 3BHK Villa in Gurgaon. We would be happy to schedule a site visit for you.\n\nBest regards,\nProperty Agent",
      status: "sent",
      sentAt: "2024-01-20T10:30:00",
      deliveryStatus: "delivered",
      type: "email",
      template: "Property Inquiry Response",
      leadId: "LEAD-001"
    },
    {
      id: 2,
      recipient: "Priya Sharma",
      recipientEmail: "priya.sharma@email.com",
      subject: "Site Visit Confirmed - 2BHK Apartment in Delhi",
      content: "Hi Priya,\n\nYour site visit for 2BHK Apartment in Delhi has been confirmed for January 22, 2024 at 2:00 PM.\n\nAddress: Sector 15, Gurgaon\n\nPlease let us know if you need to reschedule.\n\nThanks,\nProperty Agent",
      status: "scheduled",
      sentAt: null,
      scheduledFor: "2024-01-22T14:00:00",
      deliveryStatus: "pending",
      type: "email",
      template: "Site Visit Confirmation",
      leadId: "LEAD-002"
    },
    {
      id: 3,
      recipient: "Amit Singh",
      recipientEmail: "amit.singh@email.com",
      subject: "Follow-up: Property Visit",
      content: "Hi Amit,\n\nI hope you enjoyed visiting the 4BHK Villa yesterday. Do you have any questions about the property?\n\nI'm available to discuss any concerns or help with the next steps.\n\nBest regards,\nProperty Agent",
      status: "failed",
      sentAt: "2024-01-19T15:45:00",
      deliveryStatus: "failed",
      type: "email",
      template: "Follow-up After Visit",
      leadId: "LEAD-003",
      errorMessage: "Recipient email address is invalid"
    },
    {
      id: 4,
      recipient: "Neha Gupta",
      recipientEmail: "neha.gupta@email.com",
      subject: "Price Discussion - 3BHK Apartment",
      content: "Dear Neha,\n\nThank you for your interest in the 3BHK Apartment. Regarding the price discussion, we can offer a competitive rate of ₹75,00,000.\n\nThis offer is valid for 7 days. Please let me know if you'd like to proceed.\n\nRegards,\nProperty Agent",
      status: "sent",
      sentAt: "2024-01-18T11:20:00",
      deliveryStatus: "delivered",
      type: "email",
      template: "Price Negotiation Response",
      leadId: "LEAD-004"
    },
    {
      id: 5,
      recipient: "Vikram Patel",
      recipientEmail: "vikram.patel@email.com",
      subject: "Required Documents for Property Purchase",
      content: "Dear Vikram,\n\nTo proceed with the 2BHK Villa purchase, please provide the following documents:\n\n1. Identity Proof\n2. Address Proof\n3. Income Certificate\n4. Bank Statements\n\nPlease send these documents at your earliest convenience.\n\nThanks,\nProperty Agent",
      status: "sent",
      sentAt: "2024-01-17T09:15:00",
      deliveryStatus: "delivered",
      type: "email",
      template: "Document Request",
      leadId: "LEAD-005"
    }
  ]);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("sent");

  const getStatusBadge = (status) => {
    const variants = {
      "sent": "success",
      "scheduled": "warning",
      "failed": "danger",
      "draft": "secondary"
    };
    return variants[status] || "secondary";
  };

  const getDeliveryBadge = (deliveryStatus) => {
    const variants = {
      "delivered": "success",
      "pending": "warning",
      "failed": "danger",
      "bounced": "danger"
    };
    return variants[deliveryStatus] || "secondary";
  };

  const getTypeIcon = (type) => {
    const icons = {
      "email": cilSend,
      "sms": cilInfo,
      "whatsapp": cilInfo
    };
    return icons[type] || cilSend;
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || message.status === statusFilter;
    const matchesType = typeFilter === "All" || message.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const handleRetryMessage = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: "scheduled", deliveryStatus: "pending" }
        : msg
    ));
    alert("Message scheduled for retry!");
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const handleMarkAsRead = (messageId) => {
    // This would typically update read status in backend
    alert("Message marked as read!");
  };

  const sentMessages = messages.filter(msg => msg.status === "sent");
  const scheduledMessages = messages.filter(msg => msg.status === "scheduled");
  const failedMessages = messages.filter(msg => msg.status === "failed");

  const stats = {
    total: messages.length,
    sent: sentMessages.length,
    scheduled: scheduledMessages.length,
    failed: failedMessages.length,
    deliveryRate: Math.round((sentMessages.length / messages.length) * 100)
  };

  return (
    <div className="outbox-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Outbox & History</h2>
            <p>View and manage your sent messages and communication history</p>
          </div>
          <div className="header-actions">
            <Button variant="outline-light" className="me-2">
              <CIcon icon={cilReload} className="me-1" />
              Refresh
            </Button>
            <Button variant="light">
              <CIcon icon={cilSend} className="me-1" />
              New Message
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <CIcon icon={cilInbox} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Total Messages</h6>
                  <h3 className="stat-value">{stats.total}</h3>
                  <small className="stat-change text-info">All time</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon sent">
                  <CIcon icon={cilCheck} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Sent</h6>
                  <h3 className="stat-value">{stats.sent}</h3>
                  <small className="stat-change text-success">Delivered</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon scheduled">
                  <CIcon icon={cilClock} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Scheduled</h6>
                  <h3 className="stat-value">{stats.scheduled}</h3>
                  <small className="stat-change text-warning">Pending</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon failed">
                  <CIcon icon={cilX} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Failed</h6>
                  <h3 className="stat-value">{stats.failed}</h3>
                  <small className="stat-change text-danger">Need attention</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Tabs */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <CIcon icon={cilSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100">
                <CIcon icon={cilFilter} className="me-1" />
                More
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Messages Tabs */}
      <Card className="messages-card">
        <Card.Header>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-0"
          >
            <Tab eventKey="sent" title={`Sent (${sentMessages.length})`} />
            <Tab eventKey="scheduled" title={`Scheduled (${scheduledMessages.length})`} />
            <Tab eventKey="failed" title={`Failed (${failedMessages.length})`} />
          </Tabs>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Sent At</th>
                  <th>Template</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages
                  .filter(msg => {
                    if (activeTab === "sent") return msg.status === "sent";
                    if (activeTab === "scheduled") return msg.status === "scheduled";
                    if (activeTab === "failed") return msg.status === "failed";
                    return true;
                  })
                  .map(message => (
                  <tr key={message.id}>
                    <td>
                      <div className="recipient-info">
                        <div className="recipient-name">{message.recipient}</div>
                        <small className="recipient-email">{message.recipientEmail}</small>
                      </div>
                    </td>
                    <td>
                      <div className="message-subject">
                        {message.subject}
                      </div>
                    </td>
                    <td>
                      <div className="message-type">
                        <CIcon icon={getTypeIcon(message.type)} className="me-1" />
                        {message.type}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(message.status)}>
                        {message.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getDeliveryBadge(message.deliveryStatus)}>
                        {message.deliveryStatus}
                      </Badge>
                    </td>
                    <td>
                      <div className="sent-time">
                        {message.sentAt ? new Date(message.sentAt).toLocaleString() : 
                         message.scheduledFor ? `Scheduled: ${new Date(message.scheduledFor).toLocaleString()}` : 
                         'Not sent'}
                      </div>
                    </td>
                    <td>
                      <div className="template-used">
                        {message.template}
                      </div>
                    </td>
                    <td>
                      <div className="message-actions">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewMessage(message)}
                        >
                          <CIcon icon={cilViewModule} />
                        </Button>
                        
                        {message.status === "failed" && (
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            className="me-1"
                            onClick={() => handleRetryMessage(message.id)}
                          >
                            <CIcon icon={cilReload} />
                          </Button>
                        )}
                        
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <CIcon icon={cilInfo} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewMessage(message)}>
                              <CIcon icon={cilViewModule} className="me-2" />
                              View Details
                            </Dropdown.Item>
                            {message.status === "failed" && (
                              <Dropdown.Item onClick={() => handleRetryMessage(message.id)}>
                                <CIcon icon={cilReload} className="me-2" />
                                Retry
                              </Dropdown.Item>
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <CIcon icon={cilTrash} className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Message Detail Modal */}
      <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Message Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMessage && (
            <div className="message-details">
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Recipient:</strong>
                    <div>{selectedMessage.recipient}</div>
                    <small className="text-muted">{selectedMessage.recipientEmail}</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Type:</strong>
                    <div>
                      <CIcon icon={getTypeIcon(selectedMessage.type)} className="me-1" />
                      {selectedMessage.type}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <div>
                      <Badge bg={getStatusBadge(selectedMessage.status)}>
                        {selectedMessage.status}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Delivery:</strong>
                    <div>
                      <Badge bg={getDeliveryBadge(selectedMessage.deliveryStatus)}>
                        {selectedMessage.deliveryStatus}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Template:</strong>
                    <div>{selectedMessage.template}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Lead ID:</strong>
                    <div>{selectedMessage.leadId}</div>
                  </div>
                </Col>
              </Row>
              
              <div className="message-content">
                <h6>Subject:</h6>
                <div className="content-subject">
                  {selectedMessage.subject}
                </div>
                
                <h6 className="mt-3">Content:</h6>
                <div className="content-body">
                  {selectedMessage.content.split('\n').map((line, index) => (
                    <div key={index}>
                      {line}
                      {index < selectedMessage.content.split('\n').length - 1 && <br />}
                    </div>
                  ))}
                </div>
                
                {selectedMessage.errorMessage && (
                  <Alert variant="danger" className="mt-3">
                    <CIcon icon={cilWarning} className="me-2" />
                    <strong>Error:</strong> {selectedMessage.errorMessage}
                  </Alert>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMessageModal(false)}>
            Close
          </Button>
          {selectedMessage?.status === "failed" && (
            <Button variant="warning" onClick={() => handleRetryMessage(selectedMessage.id)}>
              <CIcon icon={cilReload} className="me-1" />
              Retry
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .outbox-page {
          padding: 2rem;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title h2 {
          margin: 0;
          font-weight: 700;
          font-size: 2rem;
        }

        .header-title p {
          margin: 0.5rem 0 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .stat-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          background: white;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon.sent {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .stat-icon.scheduled {
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }

        .stat-icon.failed {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }

        .stat-title {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
        }

        .stat-value {
          color: #212529;
          font-weight: 700;
          font-size: 1.75rem;
          margin: 0.25rem 0;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .messages-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          background: white;
        }

        .recipient-info {
          display: flex;
          flex-direction: column;
        }

        .recipient-name {
          font-weight: 600;
          color: #495057;
        }

        .recipient-email {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .message-subject {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #495057;
          font-weight: 500;
        }

        .message-type {
          display: flex;
          align-items: center;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .sent-time {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .template-used {
          color: #495057;
          font-size: 0.875rem;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .message-actions {
          display: flex;
          gap: 0.25rem;
        }

        .message-actions .btn {
          padding: 0.375rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-details {
          padding: 1rem 0;
        }

        .detail-item {
          margin-bottom: 1rem;
        }

        .detail-item strong {
          color: #495057;
          font-weight: 600;
        }

        .content-subject {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 6px;
          border-left: 4px solid #667eea;
          font-weight: 500;
        }

        .content-body {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          border-left: 4px solid #28a745;
          white-space: pre-line;
          line-height: 1.6;
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
          .outbox-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .stat-content {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .message-actions {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
