"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Form, 
  Table,
  Modal,
  Alert,
  Dropdown,
  ButtonGroup
} from "react-bootstrap";
import { 
  cilPeople, 
  cilUser, 
  cilUserPlus, 
  cilCheck,
  cilX,
  cilSettings,
  cilReload,
  cilArrowRight,
  cilClock,
  cilStar
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function LeadAssignmentPage() {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh@company.com",
      phone: "+91 98765 43210",
      role: "Senior Agent",
      workload: 15,
      maxCapacity: 25,
      specialization: ["Residential", "Commercial"],
      performance: 4.8,
      activeLeads: 12,
      status: "Available"
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@company.com",
      phone: "+91 87654 32109",
      role: "Agent",
      workload: 8,
      maxCapacity: 20,
      specialization: ["Residential"],
      performance: 4.6,
      activeLeads: 8,
      status: "Available"
    },
    {
      id: 3,
      name: "Amit Patel",
      email: "amit@company.com",
      phone: "+91 76543 21098",
      role: "Junior Agent",
      workload: 20,
      maxCapacity: 20,
      specialization: ["Residential"],
      performance: 4.2,
      activeLeads: 20,
      status: "Busy"
    }
  ]);

  const [unassignedLeads, setUnassignedLeads] = useState([
    {
      id: 1,
      name: "Suresh Mehta",
      email: "suresh@email.com",
      phone: "+91 91234 56789",
      source: "Website",
      priority: "High",
      propertyType: "3 BHK Villa",
      budget: "₹2.5 Cr",
      location: "Gurgaon",
      score: 85,
      createdDate: "2024-01-20"
    },
    {
      id: 2,
      name: "Neha Singh",
      email: "neha@email.com",
      phone: "+91 92345 67890",
      source: "Referral",
      priority: "Medium",
      propertyType: "2 BHK Apartment",
      budget: "₹1.8 Cr",
      location: "Delhi",
      score: 72,
      createdDate: "2024-01-19"
    },
    {
      id: 3,
      name: "Vikram Joshi",
      email: "vikram@email.com",
      phone: "+91 93456 78901",
      source: "Social Media",
      priority: "Low",
      propertyType: "1 BHK Studio",
      budget: "₹85 L",
      location: "Noida",
      score: 45,
      createdDate: "2024-01-18"
    }
  ]);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [assignmentRules, setAssignmentRules] = useState({
    autoAssign: true,
    basedOnWorkload: true,
    basedOnSpecialization: true,
    basedOnLocation: false,
    basedOnPerformance: true
  });

  const getPriorityBadge = (priority) => {
    const variants = {
      "High": "danger",
      "Medium": "warning",
      "Low": "success"
    };
    return variants[priority] || "secondary";
  };

  const getStatusBadge = (status) => {
    const variants = {
      "Available": "success",
      "Busy": "warning",
      "Offline": "secondary"
    };
    return variants[status] || "secondary";
  };

  const getWorkloadColor = (workload, maxCapacity) => {
    const percentage = (workload / maxCapacity) * 100;
    if (percentage >= 90) return "danger";
    if (percentage >= 70) return "warning";
    return "success";
  };

  const handleAssignLead = (lead) => {
    setSelectedLead(lead);
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = () => {
    if (selectedLead && selectedAgent) {
      // Remove lead from unassigned list
      setUnassignedLeads(prev => prev.filter(l => l.id !== selectedLead.id));
      
      // Update agent workload
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id 
          ? { ...agent, workload: agent.workload + 1, activeLeads: agent.activeLeads + 1 }
          : agent
      ));
      
      setShowAssignmentModal(false);
      setSelectedLead(null);
      setSelectedAgent(null);
    }
  };

  const autoAssignAll = () => {
    // Simple auto-assignment logic based on workload and specialization
    const availableAgents = agents.filter(agent => 
      agent.status === "Available" && agent.workload < agent.maxCapacity
    );
    
    if (availableAgents.length === 0) {
      alert("No available agents to assign leads to.");
      return;
    }

    // Sort agents by workload (ascending) to distribute evenly
    availableAgents.sort((a, b) => a.workload - b.workload);
    
    unassignedLeads.forEach((lead, index) => {
      const agentIndex = index % availableAgents.length;
      const agent = availableAgents[agentIndex];
      
      // Update agent workload
      setAgents(prev => prev.map(a => 
        a.id === agent.id 
          ? { ...a, workload: a.workload + 1, activeLeads: a.activeLeads + 1 }
          : a
      ));
    });
    
    // Clear unassigned leads
    setUnassignedLeads([]);
  };

  const totalUnassignedLeads = unassignedLeads.length;
  const availableAgents = agents.filter(agent => 
    agent.status === "Available" && agent.workload < agent.maxCapacity
  ).length;
  const totalAgents = agents.length;
  const avgWorkload = Math.round(agents.reduce((sum, agent) => sum + agent.workload, 0) / agents.length);

  return (
    <div className="assignment-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Lead Assignment & Routing</h2>
            <p>Manage lead distribution and agent assignments</p>
          </div>
          <div className="header-actions">
            <Button variant="outline-light" className="me-2" onClick={autoAssignAll}>
              <CIcon icon={cilReload} className="me-1" />
              Auto Assign All
            </Button>
            <Button variant="light">
              <CIcon icon={cilSettings} className="me-1" />
              Assignment Rules
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
                  <CIcon icon={cilPeople} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Unassigned Leads</h6>
                  <h3 className="stat-value">{totalUnassignedLeads}</h3>
                  <small className="stat-change text-warning">Need assignment</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon available">
                  <CIcon icon={cilUser} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Available Agents</h6>
                  <h3 className="stat-value">{availableAgents}</h3>
                  <small className="stat-change text-success">of {totalAgents} total</small>
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
                  <CIcon icon={cilClock} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Avg. Workload</h6>
                  <h3 className="stat-value">{avgWorkload}</h3>
                  <small className="stat-change text-info">leads per agent</small>
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
                  <h6 className="stat-title">Assignment Rate</h6>
                  <h3 className="stat-value">87%</h3>
                  <small className="stat-change text-success">+5% this week</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Unassigned Leads */}
        <Col lg={6}>
          <Card className="leads-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilPeople} className="me-2" />
                Unassigned Leads ({totalUnassignedLeads})
              </h5>
            </Card.Header>
            <Card.Body>
              {unassignedLeads.length === 0 ? (
                <div className="empty-state">
                  <CIcon icon={cilCheck} size="3xl" className="text-success mb-3" />
                  <h6>All leads assigned!</h6>
                  <p className="text-muted">No unassigned leads at the moment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Lead</th>
                        <th>Priority</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedLeads.map(lead => (
                        <tr key={lead.id}>
                          <td>
                            <div>
                              <h6 className="mb-1">{lead.name}</h6>
                              <small className="text-muted">{lead.propertyType}</small>
                            </div>
                          </td>
                          <td>
                            <Badge bg={getPriorityBadge(lead.priority)}>
                              {lead.priority}
                            </Badge>
                          </td>
                          <td>
                            <span className="score-badge">{lead.score}</span>
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleAssignLead(lead)}
                            >
                              <CIcon icon={cilArrowRight} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Agents */}
        <Col lg={6}>
          <Card className="agents-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilUser} className="me-2" />
                Agents ({totalAgents})
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="agents-list">
                {agents.map(agent => (
                  <div key={agent.id} className="agent-item">
                    <div className="agent-header">
                      <div className="agent-info">
                        <h6 className="agent-name">{agent.name}</h6>
                        <small className="agent-role">{agent.role}</small>
                      </div>
                      <Badge bg={getStatusBadge(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    
                    <div className="agent-stats">
                      <div className="stat-row">
                        <span>Workload:</span>
                        <div className="workload-indicator">
                          <span className="workload-text">
                            {agent.workload}/{agent.maxCapacity}
                          </span>
                          <div className="workload-bar">
                            <div 
                              className={`workload-fill ${getWorkloadColor(agent.workload, agent.maxCapacity)}`}
                              style={{ width: `${(agent.workload / agent.maxCapacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="stat-row">
                        <span>Performance:</span>
                        <span className="performance-rating">
                          <CIcon icon={cilStar} className="me-1" />
                          {agent.performance}
                        </span>
                      </div>
                      
                      <div className="stat-row">
                        <span>Specialization:</span>
                        <div className="specialization-tags">
                          {agent.specialization.map(spec => (
                            <Badge key={spec} bg="info" className="me-1">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assignment Modal */}
      <Modal show={showAssignmentModal} onHide={() => setShowAssignmentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <div>
              <h6>Lead Information</h6>
              <div className="lead-info">
                <div className="info-item">
                  <strong>Name:</strong> {selectedLead.name}
                </div>
                <div className="info-item">
                  <strong>Property:</strong> {selectedLead.propertyType}
                </div>
                <div className="info-item">
                  <strong>Budget:</strong> {selectedLead.budget}
                </div>
                <div className="info-item">
                  <strong>Priority:</strong> 
                  <Badge bg={getPriorityBadge(selectedLead.priority)} className="ms-2">
                    {selectedLead.priority}
                  </Badge>
                </div>
              </div>
              
              <hr />
              
              <h6>Select Agent</h6>
              <Form.Select 
                value={selectedAgent?.id || ''} 
                onChange={(e) => {
                  const agent = agents.find(a => a.id === parseInt(e.target.value));
                  setSelectedAgent(agent);
                }}
              >
                <option value="">Choose an agent...</option>
                {agents.filter(agent => agent.status === "Available" && agent.workload < agent.maxCapacity)
                  .map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.role}) - {agent.workload}/{agent.maxCapacity} leads
                    </option>
                  ))}
              </Form.Select>
              
              {selectedAgent && (
                <div className="agent-preview mt-3">
                  <h6>Agent Preview</h6>
                  <div className="preview-info">
                    <div className="info-item">
                      <strong>Name:</strong> {selectedAgent.name}
                    </div>
                    <div className="info-item">
                      <strong>Performance:</strong> {selectedAgent.performance}/5
                    </div>
                    <div className="info-item">
                      <strong>Specialization:</strong> {selectedAgent.specialization.join(", ")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignmentModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmAssignment}
            disabled={!selectedAgent}
          >
            <CIcon icon={cilCheck} className="me-1" />
            Assign Lead
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

        .stat-icon.available {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .leads-card, .agents-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          background: white;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }

        .score-badge {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .agent-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #e9ecef;
        }

        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .agent-name {
          margin: 0;
          font-weight: 600;
          color: #495057;
        }

        .agent-role {
          color: #6c757d;
        }

        .agent-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .workload-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .workload-text {
          font-weight: 600;
          color: #495057;
          min-width: 40px;
        }

        .workload-bar {
          width: 60px;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
        }

        .workload-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .workload-fill.success {
          background: #28a745;
        }

        .workload-fill.warning {
          background: #ffc107;
        }

        .workload-fill.danger {
          background: #dc3545;
        }

        .performance-rating {
          color: #ffc107;
          font-weight: 600;
        }

        .specialization-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .lead-info, .preview-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
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
          .assignment-page {
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

          .agent-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .stat-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
