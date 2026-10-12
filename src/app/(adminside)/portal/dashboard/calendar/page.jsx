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
  ListGroup
} from "react-bootstrap";
import { 
  cilCalendar, 
  cilPlus, 
  cilLocationPin, 
  cilClock,
  cilUser,
  cilViewModule,
  cilPencil,
  cilTrash,
  cilCheck,
  cilX,
  cilWarning,
  cilInfo,
  cilFilter,
  cilSearch
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function CalendarPage() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Site Visit - 3BHK Villa, Gurgaon",
      type: "site_visit",
      clientName: "Rajesh Kumar",
      clientPhone: "+91 98765 43210",
      propertyTitle: "3BHK Villa in Sector 15",
      propertyAddress: "Sector 15, Gurgaon, Haryana",
      date: "2024-01-22",
      startTime: "10:00",
      endTime: "11:00",
      status: "confirmed",
      priority: "high",
      notes: "Client is interested in purchasing. Bring property documents.",
      agent: "John Doe",
      createdAt: "2024-01-20T09:00:00"
    },
    {
      id: 2,
      title: "Callback - Priya Sharma",
      type: "callback",
      clientName: "Priya Sharma",
      clientPhone: "+91 98765 43211",
      propertyTitle: "2BHK Apartment in Delhi",
      date: "2024-01-22",
      startTime: "14:00",
      endTime: "14:30",
      status: "scheduled",
      priority: "medium",
      notes: "Follow up on property visit feedback",
      agent: "Jane Smith",
      createdAt: "2024-01-21T10:30:00"
    },
    {
      id: 3,
      title: "Property Presentation - 4BHK Villa",
      type: "presentation",
      clientName: "Amit Singh",
      clientPhone: "+91 98765 43212",
      propertyTitle: "4BHK Villa in Noida",
      propertyAddress: "Sector 62, Noida, UP",
      date: "2024-01-23",
      startTime: "16:00",
      endTime: "17:30",
      status: "pending",
      priority: "high",
      notes: "Prepare presentation slides and financial details",
      agent: "John Doe",
      createdAt: "2024-01-20T14:15:00"
    },
    {
      id: 4,
      title: "Document Collection",
      type: "task",
      clientName: "Neha Gupta",
      clientPhone: "+91 98765 43213",
      propertyTitle: "3BHK Apartment",
      date: "2024-01-24",
      startTime: "11:00",
      endTime: "12:00",
      status: "scheduled",
      priority: "medium",
      notes: "Collect KYC documents from client",
      agent: "Jane Smith",
      createdAt: "2024-01-19T16:45:00"
    },
    {
      id: 5,
      title: "Site Visit - 2BHK Apartment, Bangalore",
      type: "site_visit",
      clientName: "Vikram Patel",
      clientPhone: "+91 98765 43214",
      propertyTitle: "2BHK Apartment in Koramangala",
      propertyAddress: "Koramangala, Bangalore, Karnataka",
      date: "2024-01-25",
      startTime: "09:30",
      endTime: "10:30",
      status: "confirmed",
      priority: "medium",
      notes: "Client coming from out of town",
      agent: "John Doe",
      createdAt: "2024-01-18T11:20:00"
    }
  ]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list");

  const getTypeBadge = (type) => {
    const variants = {
      "site_visit": "success",
      "callback": "info",
      "presentation": "warning",
      "task": "secondary"
    };
    return variants[type] || "secondary";
  };

  const getStatusBadge = (status) => {
    const variants = {
      "confirmed": "success",
      "scheduled": "warning",
      "pending": "info",
      "completed": "primary",
      "cancelled": "danger"
    };
    return variants[status] || "secondary";
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      "high": "danger",
      "medium": "warning",
      "low": "info"
    };
    return variants[priority] || "secondary";
  };

  const getTypeIcon = (type) => {
    const icons = {
      "site_visit": cilLocationPin,
      "callback": cilUser,
      "presentation": cilInfo,
      "task": cilCheck
    };
    return icons[type] || cilCalendar;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "All" || event.type === typeFilter;
    const matchesStatus = statusFilter === "All" || event.status === statusFilter;
    
    const matchesDate = (() => {
      if (dateFilter === "All") return true;
      const today = new Date();
      const eventDate = new Date(event.date);
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "Today": return diffDays === 0;
        case "Tomorrow": return diffDays === 1;
        case "This Week": return diffDays >= 0 && diffDays <= 7;
        case "Next Week": return diffDays > 7 && diffDays <= 14;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleUpdateStatus = (eventId, newStatus) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(event => event.date === today);
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).slice(0, 5);

  const stats = {
    total: events.length,
    today: todayEvents.length,
    confirmed: events.filter(e => e.status === "confirmed").length,
    pending: events.filter(e => e.status === "pending").length
  };

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Calendar & Events</h2>
            <p>Manage your site visits, callbacks, and property-related appointments</p>
          </div>
          <div className="header-actions">
            <Button variant="primary" className="me-2">
              <CIcon icon={cilPlus} className="me-1" />
              Add Event
            </Button>
            <Button variant="outline-light">
              <CIcon icon={cilCalendar} className="me-1" />
              Calendar View
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
                  <CIcon icon={cilCalendar} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Total Events</h6>
                  <h3 className="stat-value">{stats.total}</h3>
                  <small className="stat-change text-info">This month</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon today">
                  <CIcon icon={cilClock} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Today</h6>
                  <h3 className="stat-value">{stats.today}</h3>
                  <small className="stat-change text-warning">Events scheduled</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon confirmed">
                  <CIcon icon={cilCheck} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Confirmed</h6>
                  <h3 className="stat-value">{stats.confirmed}</h3>
                  <small className="stat-change text-success">Ready to go</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon pending">
                  <CIcon icon={cilWarning} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Pending</h6>
                  <h3 className="stat-value">{stats.pending}</h3>
                  <small className="stat-change text-danger">Need attention</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Filters */}
        <Col lg={8}>
          <Card className="filters-card mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <CIcon icon={cilSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="site_visit">Site Visit</option>
                    <option value="callback">Callback</option>
                    <option value="presentation">Presentation</option>
                    <option value="task">Task</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Week">This Week</option>
                    <option value="Next Week">Next Week</option>
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

          {/* Events List */}
          <Card className="events-card">
            <Card.Header>
              <h5 className="mb-0">
                Events ({filteredEvents.length})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Client</th>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map(event => (
                      <tr key={event.id}>
                        <td>
                          <div className="event-info">
                            <h6 className="event-title">{event.title}</h6>
                            <small className="event-property">{event.propertyTitle}</small>
                          </div>
                        </td>
                        <td>
                          <div className="client-info">
                            <div className="client-name">{event.clientName}</div>
                            <small className="client-phone">{event.clientPhone}</small>
                          </div>
                        </td>
                        <td>
                          <div className="datetime-info">
                            <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
                            <small className="event-time">{event.startTime} - {event.endTime}</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getTypeBadge(event.type)}>
                            <CIcon icon={getTypeIcon(event.type)} className="me-1" />
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(event.status)}>
                            {event.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getPriorityBadge(event.priority)}>
                            {event.priority}
                          </Badge>
                        </td>
                        <td>
                          <div className="event-actions">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="me-1"
                              onClick={() => handleViewEvent(event)}
                            >
                              <CIcon icon={cilViewModule} />
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <CIcon icon={cilPencil} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleUpdateStatus(event.id, "confirmed")}>
                                  <CIcon icon={cilCheck} className="me-2" />
                                  Confirm
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateStatus(event.id, "completed")}>
                                  <CIcon icon={cilCheck} className="me-2" />
                                  Mark Complete
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUpdateStatus(event.id, "cancelled")}>
                                  <CIcon icon={cilX} className="me-2" />
                                  Cancel
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => handleDeleteEvent(event.id)}
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
        </Col>

        {/* Today's Events & Quick Actions */}
        <Col lg={4}>
          {/* Today's Events */}
          <Card className="today-events-card mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilClock} className="me-2" />
                Today&apos;s Events ({todayEvents.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {todayEvents.length > 0 ? (
                <ListGroup variant="flush">
                  {todayEvents.map(event => (
                    <ListGroup.Item key={event.id} className="today-event-item">
                      <div className="event-summary">
                        <div className="event-time">{event.startTime}</div>
                        <div className="event-details">
                          <h6 className="event-title">{event.title}</h6>
                          <small className="event-client">{event.clientName}</small>
                        </div>
                        <Badge bg={getStatusBadge(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="no-events">
                  <CIcon icon={cilCalendar} size="2xl" className="text-muted mb-2" />
                  <p className="text-muted">No events scheduled for today</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="quick-actions-card">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-actions">
                <Button variant="primary" className="w-100 mb-2">
                  <CIcon icon={cilPlus} className="me-1" />
                  Schedule Site Visit
                </Button>
                <Button variant="outline-primary" className="w-100 mb-2">
                  <CIcon icon={cilUser} className="me-1" />
                  Add Callback
                </Button>
                <Button variant="outline-success" className="w-100 mb-2">
                  <CIcon icon={cilInfo} className="me-1" />
                  Schedule Presentation
                </Button>
                <Button variant="outline-secondary" className="w-100">
                  <CIcon icon={cilCheck} className="me-1" />
                  Add Task
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Event Detail Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div className="event-details">
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Event Title:</strong>
                    <div>{selectedEvent.title}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Type:</strong>
                    <div>
                      <Badge bg={getTypeBadge(selectedEvent.type)}>
                        <CIcon icon={getTypeIcon(selectedEvent.type)} className="me-1" />
                        {selectedEvent.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Client:</strong>
                    <div>{selectedEvent.clientName}</div>
                    <small className="text-muted">{selectedEvent.clientPhone}</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Property:</strong>
                    <div>{selectedEvent.propertyTitle}</div>
                    {selectedEvent.propertyAddress && (
                      <small className="text-muted">{selectedEvent.propertyAddress}</small>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Date & Time:</strong>
                    <div>
                      {new Date(selectedEvent.date).toLocaleDateString()}
                      <br />
                      <small className="text-muted">{selectedEvent.startTime} - {selectedEvent.endTime}</small>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <strong>Status & Priority:</strong>
                    <div>
                      <Badge bg={getStatusBadge(selectedEvent.status)} className="me-2">
                        {selectedEvent.status}
                      </Badge>
                      <Badge bg={getPriorityBadge(selectedEvent.priority)}>
                        {selectedEvent.priority}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <div className="event-notes">
                <h6>Notes:</h6>
                <div className="notes-content">
                  {selectedEvent.notes}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            <CIcon icon={cilPencil} className="me-1" />
            Edit Event
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */
        
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

        .stat-icon.today {
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }

        .stat-icon.confirmed {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
          color: #212529;
          font-weight: 700;
          font-size: 1.75rem;
          margin: 0.25rem 0;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .filters-card, .events-card, .today-events-card, .quick-actions-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          background: white;
        }

        .event-info {
          display: flex;
          flex-direction: column;
        }

        .event-title {
          margin: 0;
          font-weight: 600;
          color: #495057;
        }

        .event-property {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .client-info {
          display: flex;
          flex-direction: column;
        }

        .client-name {
          font-weight: 600;
          color: #495057;
        }

        .client-phone {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .datetime-info {
          display: flex;
          flex-direction: column;
        }

        .event-date {
          font-weight: 600;
          color: #495057;
        }

        .event-time {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .event-actions {
          display: flex;
          gap: 0.25rem;
        }

        .event-actions .btn {
          padding: 0.375rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .today-event-item {
          border: none;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .event-summary {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .event-time {
          font-weight: 600;
          color: #667eea;
          min-width: 50px;
        }

        .event-details {
          flex: 1;
        }

        .event-details .event-title {
          margin: 0 0 0.25rem;
          font-size: 0.875rem;
        }

        .event-client {
          color: #6c757d;
          font-size: 0.75rem;
        }

        .no-events {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .event-details {
          padding: 1rem 0;
        }

        .detail-item {
          margin-bottom: 1rem;
        }

        .detail-item strong {
          color: #495057;
          font-weight: 600;
        }

        .event-notes {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .notes-content {
          white-space: pre-line;
          line-height: 1.6;
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
          .calendar-page {
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

          .event-actions {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
