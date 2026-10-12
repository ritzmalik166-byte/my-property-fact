/**
 * Error handling utilities for the portal
 */

export const ERROR_TYPES = {
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
  FORBIDDEN: '403',
  NETWORK_ERROR: 'network',
  MAINTENANCE: 'maintenance',
  VALIDATION_ERROR: 'validation',
  AUTHENTICATION_ERROR: 'auth'
};

/**
 * Redirect to appropriate error page
 * @param {string} errorType - Type of error
 * @param {string} message - Custom error message
 */
export const redirectToErrorPage = (errorType, message = null) => {
  const params = new URLSearchParams({ error: errorType });
  if (message) {
    params.append('message', message);
  }
  
  const errorUrl = `/portal/dashboard/error?${params.toString()}`;
  window.location.href = errorUrl;
};

/**
 * Handle API errors and redirect appropriately
 * @param {Error} error - The error object
 * @param {Object} response - The response object (if available)
 */
export const handleApiError = (error, response = null) => {
  console.error('API Error:', error, response);

  // Network errors
  if (!navigator.onLine) {
    redirectToErrorPage(ERROR_TYPES.NETWORK_ERROR);
    return;
  }

  // HTTP status code based errors
  if (response?.status) {
    switch (response.status) {
      case 404:
        redirectToErrorPage(ERROR_TYPES.NOT_FOUND, 'Resource not found');
        break;
      case 403:
        redirectToErrorPage(ERROR_TYPES.FORBIDDEN, 'Access denied');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        redirectToErrorPage(ERROR_TYPES.SERVER_ERROR, 'Server error occurred');
        break;
      case 503:
        redirectToErrorPage(ERROR_TYPES.MAINTENANCE, 'Service temporarily unavailable');
        break;
      default:
        redirectToErrorPage(ERROR_TYPES.SERVER_ERROR, 'An unexpected error occurred');
    }
  } else {
    // Generic errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
      redirectToErrorPage(ERROR_TYPES.NETWORK_ERROR);
    } else {
      redirectToErrorPage(ERROR_TYPES.SERVER_ERROR);
    }
  }
};

/**
 * Handle component errors
 * @param {Error} error - The error object
 * @param {string} componentName - Name of the component where error occurred
 */
export const handleComponentError = (error, componentName = 'Unknown') => {
  console.error(`Component Error in ${componentName}:`, error);
  
  // For development, you might want to show more details
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      component: componentName,
      message: error.message,
      stack: error.stack
    });
  }
  
  // Redirect to error page
  redirectToErrorPage(ERROR_TYPES.SERVER_ERROR, `Error in ${componentName}`);
};

/**
 * Create a custom error object
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Object} details - Additional error details
 */
export const createError = (message, type = ERROR_TYPES.SERVER_ERROR, details = {}) => {
  const error = new Error(message);
  error.type = type;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
};

/**
 * Log error to external service (placeholder)
 * @param {Error} error - The error object
 * @param {Object} context - Additional context
 */
export const logErrorToService = async (error, context = {}) => {
  try {
    // This is a placeholder for error logging service integration
    // You can integrate with services like Sentry, LogRocket, etc.
    
    const errorData = {
      message: error.message,
      stack: error.stack,
      type: error.type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context
    };
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
};

/**
 * Check if error is recoverable
 * @param {Error} error - The error object
 */
export const isRecoverableError = (error) => {
  const recoverableTypes = [
    ERROR_TYPES.NETWORK_ERROR,
    ERROR_TYPES.SERVER_ERROR
  ];
  
  return recoverableTypes.includes(error.type);
};

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 */
export const getUserFriendlyMessage = (error) => {
  const friendlyMessages = {
    [ERROR_TYPES.NOT_FOUND]: 'The page you\'re looking for doesn\'t exist.',
    [ERROR_TYPES.SERVER_ERROR]: 'Something went wrong on our end. We\'re working to fix it.',
    [ERROR_TYPES.FORBIDDEN]: 'You don\'t have permission to access this resource.',
    [ERROR_TYPES.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
    [ERROR_TYPES.MAINTENANCE]: 'We\'re currently performing scheduled maintenance.',
    [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Please log in to continue.'
  };

  return friendlyMessages[error.type] || 'An unexpected error occurred.';
};
