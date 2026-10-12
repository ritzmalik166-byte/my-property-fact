"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Form,
  InputGroup,
  Table,
  Modal,
  Alert,
  Dropdown
} from "react-bootstrap";
import { 
  cilEnvelopeOpen, 
  cilSearch, 
  cilFilter, 
  cilPlus, 
  cilViewModule, 
  cilPencil, 
  cilTrash,
  cilSend,
  cilMediaSkipForward,
  cilStar,
  cilCheck,
  cilClock,
  cilUser,
  cilPaperclip
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function InboxPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      subject: "Property Inquiry - 3BHK Villa in Gurgaon",
      preview: "Hi, I'm interested in the 3BHK villa you listed. Could you please share more details about the property?",
      receivedAt: "2024-01-20T10:30:00",
      isRead: false,
      priority: "High",
      type: "inquiry",
      attachments: 2,
      propertyId: "PROP-001"
    },
    {
      id: 2,
      from: "Priya Sharma",
      email: "priya.sharma@email.com",
      subject: "Site Visit Request",
      preview: "Would like to schedule a site visit for the 2BHK apartment in Delhi. Available this weekend.",
      receivedAt: "2024-01-20T09:15:00",
      isRead: true,
      priority: "Medium",
      type: "visit",
      attachments: 0,
      propertyId: "PROP-002"
    },
    {
      id: 3,
      from: "Amit Patel",
      email: "amit.patel@email.com",
      subject: "Pricing Negotiation",
      preview: "Hi, I'm interested in the 1BHK studio. Is the price negotiable?",
      receivedAt: "2024-01-19T16:45:00",
      isRead: false,
      priority: "Medium",
      type: "negotiation",
      attachments: 1,
      propertyId: "PROP-003"
    },
    {
      id: 4,
      from: "Neha Singh",
      email: "neha.singh@email.com",
      subject: "Document Requirements",
      preview: "What documents do I need to provide for the loan application?",
      receivedAt: "2024-01-19T14:20:00",
      isRead: true,
      priority: "Low",
      type: "information",
      attachments: 0,
      propertyId: "PROP-001"
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [readFilter, setReadFilter] = useState("All");

  const getPriorityBadge = (priority) => {
    const variants = {
      "High": "danger",
      "Medium": "warning",
      "Low": "success"
    };
    return variants[priority] || "secondary";
  };

  const getTypeBadge = (type) => {
    const variants = {
      "inquiry": "primary",
      "visit": "info",
      "negotiation": "warning",
      "information": "secondary"
    };
    return variants[type] || "secondary";
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "All" || message.priority === priorityFilter;
    const matchesType = typeFilter === "All" || message.type === typeFilter;
    const matchesRead = readFilter === "All" || 
                       (readFilter === "Read" && message.isRead) ||
                       (readFilter === "Unread" && !message.isRead);
    
    return matchesSearch && matchesPriority && matchesType && matchesRead;
  });

  const handleReadMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mark as read
    setMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, isRead: true } : msg
    ));
  };

  const handleReply = (message) => {
    setSelectedMessage(message);
    setShowComposeModal(true);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const highPriorityCount = messages.filter(m => m.priority === "High" && !m.isRead).length;

  return (
    <div className="inbox-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h2>Inbox</h2>
            <p>Manage your incoming messages and inquiries</p>
          </div>
          <div className="header-actions">
            <Button variant="primary" onClick={() => setShowComposeModal(true)}>
              <CIcon icon={cilPlus} className="me-1" />
              Compose
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
                  <CIcon icon={cilEnvelopeOpen} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Total Messages</h6>
                  <h3 className="stat-value">{messages.length}</h3>
                  <small className="stat-change text-info">+5 this week</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon unread">
                  <CIcon icon={cilClock} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Unread</h6>
                  <h3 className="stat-value">{unreadCount}</h3>
                  <small className="stat-change text-warning">Needs attention</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon high-priority">
                  <CIcon icon={cilStar} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">High Priority</h6>
                  <h3 className="stat-value">{highPriorityCount}</h3>
                  <small className="stat-change text-danger">Urgent</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <CIcon icon={cilCheck} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Response Rate</h6>
                  <h3 className="stat-value">92%</h3>
                  <small className="stat-change text-success">+3% this month</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
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
            <Col md={2}>
              <Form.Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="inquiry">Inquiry</option>
                <option value="visit">Site Visit</option>
                <option value="negotiation">Negotiation</option>
                <option value="information">Information</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
              >
                <option value="All">All Messages</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100">
                <CIcon icon={cilFilter} className="me-1" />
                More Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Messages Table */}
      <Card className="messages-table-card">
        <Card.Header>
          <h5 className="mb-0">
            Messages ({filteredMessages.length})
            {unreadCount > 0 && (
              <Badge bg="warning" className="ms-2">
                {unreadCount} unread
              </Badge>
            )}
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th width="40px"></th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Received</th>
                  <th width="120px">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map(message => (
                  <tr 
                    key={message.id} 
                    className={!message.isRead ? 'unread-row' : ''}
                  >
                    <td>
                      <div className="message-indicators">
                        {!message.isRead && <div className="unread-dot"></div>}
                        {message.attachments > 0 && (
                          <CIcon icon={cilPaperclip} className="attachment-icon" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="sender-info">
                        <div className="sender-avatar">
                          <CIcon icon={cilUser} />
                        </div>
                        <div>
                          <h6 className="sender-name">{message.from}</h6>
                          <small className="sender-email">{message.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="message-subject">
                        <h6 className="subject-title">{message.subject}</h6>
                        <p className="subject-preview">{message.preview}</p>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getTypeBadge(message.type)}>
                        {message.type}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getPriorityBadge(message.priority)}>
                        {message.priority}
                      </Badge>
                    </td>
                    <td>
                      <div className="time-info">
                        <div>{new Date(message.receivedAt).toLocaleDateString()}</div>
                        <small className="text-muted">
                          {new Date(message.receivedAt).toLocaleTimeString()}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleReadMessage(message)}
                        >
                          <CIcon icon={cilViewModule} />
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleReply(message)}
                        >
                          <CIcon icon={cilSend} />
                        </Button>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <CIcon icon={cilPencil} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <CIcon icon={cilMediaSkipForward} className="me-2" />
                              Forward
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <CIcon icon={cilStar} className="me-2" />
                              Star
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger">
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
            <div className="message-detail">
              <div className="message-header">
                <div className="sender-detail">
                  <div className="sender-avatar-large">
                    <CIcon icon={cilUser} />
                  </div>
                  <div>
                    <h5>{selectedMessage.from}</h5>
                    <p className="text-muted">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="message-meta">
                  <Badge bg={getPriorityBadge(selectedMessage.priority)} className="me-2">
                    {selectedMessage.priority}
                  </Badge>
                  <Badge bg={getTypeBadge(selectedMessage.type)}>
                    {selectedMessage.type}
                  </Badge>
                </div>
              </div>
              
              <hr />
              
              <div className="message-content">
                <h6>{selectedMessage.subject}</h6>
                <div className="message-body">
                  <p>{selectedMessage.preview}</p>
                  <p>I would like to know more about this property and schedule a visit if possible. Please let me know your availability and any additional information you can provide.</p>
                  <p>Looking forward to your response.</p>
                  <p>Best regards,<br />{selectedMessage.from}</p>
                </div>
              </div>
              
              {selectedMessage.attachments > 0 && (
                <div className="message-attachments">
                  <h6>Attachments ({selectedMessage.attachments})</h6>
                  <div className="attachment-list">
                    <div className="attachment-item">
                      <CIcon icon={cilPaperclip} className="me-2" />
                      property-details.pdf
                    </div>
                    <div className="attachment-item">
                      <CIcon icon={cilPaperclip} className="me-2" />
                      floor-plan.jpg
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMessageModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={() => handleReply(selectedMessage)}>
            <CIcon icon={cilSend} className="me-1" />
            Reply
          </Button>
          <Button variant="info">
            <CIcon icon={cilMediaSkipForward} className="me-1" />
            Forward
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .inbox-page {
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

        .stat-icon.unread {
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }

        .stat-icon.high-priority {
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

        .messages-table-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          background: white;
        }

        .messages-table-card .card-header {
          background: transparent;
          border-bottom: 1px solid #e9ecef;
          padding: 1.25rem;
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

        .unread-row {
          background-color: #f8f9ff;
          font-weight: 500;
        }

        .message-indicators {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
        }

        .attachment-icon {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .sender-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sender-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .sender-name {
          margin: 0;
          font-weight: 600;
          color: #495057;
        }

        .sender-email {
          color: #6c757d;
        }

        .message-subject {
          max-width: 300px;
        }

        .subject-title {
          margin: 0 0 0.25rem;
          font-weight: 600;
          color: #495057;
        }

        .subject-preview {
          margin: 0;
          color: #6c757d;
          font-size: 0.875rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .time-info {
          text-align: right;
        }

        .action-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .action-buttons .btn {
          padding: 0.375rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-detail {
          padding: 1rem;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .sender-detail {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sender-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .message-meta {
          display: flex;
          gap: 0.5rem;
        }

        .message-content h6 {
          margin-bottom: 1rem;
          color: #495057;
        }

        .message-body {
          line-height: 1.6;
          color: #495057;
        }

        .message-attachments {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .attachment-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          color: #495057;
        }

        @media (max-width: 768px) {
          .inbox-page {
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

          .sender-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .message-header {
            flex-direction: column;
            gap: 1rem;
          }

          .sender-detail {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .action-buttons {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
