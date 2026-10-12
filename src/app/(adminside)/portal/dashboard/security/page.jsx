"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form,
  Alert,
  Badge,
  ListGroup,
  Modal,
  InputGroup
} from "react-bootstrap";
import { 
  cilShieldAlt, 
  cilLockLocked, 
  cilUser,
  cilCheck,
  cilX,
  cilWarning,
  cilSettings,
  cilHistory,
  cilPhone,
  cilEnvelope,
  cilInfo
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function SecurityPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);

  const securitySettings = {
    passwordStrength: "Strong",
    lastPasswordChange: "2024-01-15",
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: "2 hours",
    trustedDevices: 3,
    recentLogins: [
      {
        id: 1,
        location: "Gurgaon, India",
        device: "Chrome on Windows",
        timestamp: "2024-01-20T10:30:00",
        ipAddress: "192.168.1.100",
        status: "success"
      },
      {
        id: 2,
        location: "Delhi, India", 
        device: "Safari on iPhone",
        timestamp: "2024-01-19T15:45:00",
        ipAddress: "10.0.0.50",
        status: "success"
      },
      {
        id: 3,
        location: "Unknown Location",
        device: "Chrome on Android",
        timestamp: "2024-01-18T22:15:00",
        ipAddress: "203.0.113.45",
        status: "blocked"
      }
    ]
  };

  const getStatusBadge = (status) => {
    const variants = {
      "success": "success",
      "blocked": "danger",
      "warning": "warning"
    };
    return variants[status] || "secondary";
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    
    // Here you would typically make an API call
    alert("Password changed successfully!");
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorModal(true);
    } else {
      setTwoFactorEnabled(false);
      alert("Two-factor authentication disabled!");
    }
  };

  const enableTwoFactor = () => {
    setTwoFactorEnabled(true);
    setShowTwoFactorModal(false);
    alert("Two-factor authentication enabled! Please scan the QR code with your authenticator app.");
  };

  return (
    <div className="security-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Security Settings</h2>
            <p>Manage your account security and privacy settings</p>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* Password Security */}
        <Col lg={6}>
          <Card className="security-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilLockLocked} className="me-2" />
                Password Security
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="password-info">
                <div className="info-item">
                  <strong>Password Strength:</strong>
                  <Badge bg="success" className="ms-2">{securitySettings.passwordStrength}</Badge>
                </div>
                <div className="info-item">
                  <strong>Last Changed:</strong>
                  <span className="ms-2">{new Date(securitySettings.lastPasswordChange).toLocaleDateString()}</span>
                </div>
              </div>
              
                            <Button
                variant="primary" 
                className="mt-3"
                onClick={() => setShowPasswordModal(true)}
              >
                <CIcon icon={cilLockLocked} className="me-1" />
                Change Password
              </Button>
            </Card.Body>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="security-card mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilShieldAlt} className="me-2" />
                Two-Factor Authentication
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="two-factor-info">
                <div className="info-item">
                  <strong>Status:</strong>
                  <Badge bg={twoFactorEnabled ? "success" : "warning"} className="ms-2">
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-muted mt-2">
                  Add an extra layer of security to your account by requiring a second verification step.
                </p>
              </div>
              
              <Button 
                variant={twoFactorEnabled ? "outline-danger" : "primary"}
                onClick={handleTwoFactorToggle}
                className="mt-3"
              >
                <CIcon icon={twoFactorEnabled ? cilX : cilCheck} className="me-1" />
                {twoFactorEnabled ? "Disable" : "Enable"} 2FA
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col lg={6}>
          <Card className="security-card">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilSettings} className="me-2" />
                Security Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>Login Alerts</h6>
                    <small className="text-muted">Get notified of new login attempts</small>
                  </div>
                  <Form.Check
                    type="switch"
                    defaultChecked={securitySettings.loginAlerts}
                  />
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>Session Timeout</h6>
                    <small className="text-muted">Auto-logout after inactivity</small>
                  </div>
                  <Badge bg="info">{securitySettings.sessionTimeout}</Badge>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>Trusted Devices</h6>
                    <small className="text-muted">Manage your trusted devices</small>
                  </div>
                  <Badge bg="secondary">{securitySettings.trustedDevices}</Badge>
                </div>
              </div>
              
              <Button variant="outline-primary" className="mt-3 w-100">
                <CIcon icon={cilSettings} className="me-1" />
                Advanced Settings
              </Button>
            </Card.Body>
          </Card>

          {/* Security Tips */}
          <Card className="security-card mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <CIcon icon={cilWarning} className="me-2" />
                Security Tips
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <CIcon icon={cilCheck} className="me-2 text-success" />
                  Use a strong, unique password
                </ListGroup.Item>
                <ListGroup.Item>
                  <CIcon icon={cilCheck} className="me-2 text-success" />
                  Enable two-factor authentication
                </ListGroup.Item>
                <ListGroup.Item>
                  <CIcon icon={cilCheck} className="me-2 text-success" />
                  Log out from shared devices
                </ListGroup.Item>
                <ListGroup.Item>
                  <CIcon icon={cilCheck} className="me-2 text-success" />
                  Keep your contact information updated
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Login Activity */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">
            <CIcon icon={cilHistory} className="me-2" />
            Recent Login Activity
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Device</th>
                  <th>IP Address</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {securitySettings.recentLogins.map(login => (
                  <tr key={login.id}>
                    <td>
                      <div className="location-info">
                        <CIcon icon={cilUser} className="me-2" />
                        {login.location}
                      </div>
                    </td>
                    <td>{login.device}</td>
                    <td>
                      <code>{login.ipAddress}</code>
                    </td>
                    <td>{new Date(login.timestamp).toLocaleString()}</td>
                    <td>
                      <Badge bg={getStatusBadge(login.status)}>
                        {login.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Two-Factor Setup Modal */}
      <Modal show={showTwoFactorModal} onHide={() => setShowTwoFactorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enable Two-Factor Authentication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <CIcon icon={cilInfo} className="me-2" />
            Two-factor authentication adds an extra layer of security to your account.
          </Alert>
          
          <div className="two-factor-setup">
            <h6>Step 1: Install an Authenticator App</h6>
            <p className="text-muted">
              Download an authenticator app like Google Authenticator or Authy on your mobile device.
            </p>
            
            <h6 className="mt-4">Step 2: Scan QR Code</h6>
            <div className="qr-code-placeholder">
              <div className="qr-code">
                <CIcon icon={cilShieldAlt} size="3xl" />
              </div>
              <p className="text-muted mt-2">QR Code will be displayed here</p>
            </div>
            
            <h6 className="mt-4">Step 3: Enter Verification Code</h6>
            <Form.Control
              type="text"
              placeholder="Enter 6-digit code from your app"
              className="mt-2"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTwoFactorModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={enableTwoFactor}>
            Enable 2FA
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */
        
        .security-card {
          height: 100%;
        }

        .password-info, .two-factor-info {
          margin-bottom: 1rem;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .location-info {
          display: flex;
          align-items: center;
        }

        .two-factor-setup {
          padding: 1rem 0;
        }

        .qr-code-placeholder {
          text-align: center;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }

        .qr-code {
          color: #6c757d;
        }
      `}</style>
    </div>
  );
}
