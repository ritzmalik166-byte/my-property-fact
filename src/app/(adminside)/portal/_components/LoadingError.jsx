"use client";
import { useState } from "react";
import { 
  Card, 
  Button, 
  Alert,
  Spinner
} from "react-bootstrap";
import { 
  cilReload, 
  cilWarning,
  cilHome,
  cilArrowLeft
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { redirectToErrorPage, ERROR_TYPES } from "./errorUtils";

export default function LoadingError({ 
  error, 
  retry, 
  showRetry = true,
  customMessage = null 
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (retry) {
        await retry();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Retry failed:', error);
      redirectToErrorPage(ERROR_TYPES.SERVER_ERROR, 'Failed to reload the page');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/portal/dashboard";
    }
  };

  const getErrorMessage = () => {
    if (customMessage) return customMessage;
    
    if (error?.message?.includes('404')) {
      return "The requested resource was not found.";
    }
    if (error?.message?.includes('500')) {
      return "A server error occurred while loading the page.";
    }
    if (error?.message?.includes('network')) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    
    return "Failed to load the page. Please try again.";
  };

  return (
    <div className="loading-error">
      <Card className="error-card">
        <Card.Body className="text-center">
          <div className="error-icon">
            <CIcon icon={cilWarning} />
          </div>
          
          <h4 className="error-title">Loading Error</h4>
          <p className="error-message">{getErrorMessage()}</p>
          
          {error && process.env.NODE_ENV === 'development' && (
            <Alert variant="danger" className="error-details">
              <strong>Development Error Details:</strong>
              <pre className="mt-2">{error.message}</pre>
            </Alert>
          )}
          
          <div className="error-actions">
            {showRetry && (
              <Button 
                variant="primary" 
                onClick={handleRetry}
                disabled={isRetrying}
                className="me-2"
              >
                {isRetrying ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilReload} className="me-1" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            
            <Button 
              variant="outline-secondary" 
              onClick={handleGoBack}
              className="me-2"
            >
              <CIcon icon={cilArrowLeft} className="me-1" />
              Go Back
            </Button>
            
            <Button 
              variant="outline-primary" 
              onClick={() => window.location.href = "/portal/dashboard"}
            >
              <CIcon icon={cilHome} className="me-1" />
              Dashboard
            </Button>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .loading-error {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #f8f9fa;
        }

        .error-card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          background: white;
          max-width: 500px;
          width: 100%;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
          margin: 0 auto 1.5rem;
        }

        .error-title {
          color: #495057;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .error-message {
          color: #6c757d;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .error-details {
          margin-bottom: 2rem;
          text-align: left;
        }

        .error-details pre {
          font-size: 0.8rem;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }

        .error-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .error-actions .btn {
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .error-actions .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 576px) {
          .loading-error {
            padding: 1rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .error-actions .btn {
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}
