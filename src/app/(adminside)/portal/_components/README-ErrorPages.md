# Portal Error Pages System

This document describes the comprehensive error handling system implemented for the portal dashboard.

## 🚨 Error Components

### 1. ErrorPage.jsx
**Main error page component** with beautiful design and multiple error types support.

**Features:**
- Multiple error types (404, 500, 403, network, maintenance)
- Customizable messages and actions
- Auto-retry functionality for server errors
- Quick navigation links
- Responsive design
- Gradient backgrounds and animations

**Usage:**
```jsx
import ErrorPage from "./ErrorPage";

<ErrorPage
  errorType="404"
  title="Custom Title"
  message="Custom message"
  showRetry={true}
  showHome={true}
  customActions={<CustomButtons />}
/>
```

### 2. ErrorBoundary.jsx
**React Error Boundary** for catching JavaScript errors in component tree.

**Features:**
- Catches component errors
- Logs error details
- Provides fallback UI
- Retry functionality
- Development error details

**Usage:**
```jsx
import ErrorBoundary from "./ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 3. LoadingError.jsx
**Loading state error component** for failed page loads.

**Features:**
- Retry functionality
- Custom error messages
- Loading states
- Development error details
- Multiple action buttons

### 4. errorUtils.js
**Utility functions** for error handling and management.

**Functions:**
- `redirectToErrorPage()` - Redirect to appropriate error page
- `handleApiError()` - Handle API errors
- `handleComponentError()` - Handle component errors
- `createError()` - Create custom error objects
- `logErrorToService()` - Log errors to external service
- `isRecoverableError()` - Check if error is recoverable
- `getUserFriendlyMessage()` - Get user-friendly error messages

## 📁 Error Page Files

### Portal Error Pages
- `/portal/dashboard/error/page.jsx` - Main error page handler
- `/portal/not-found.jsx` - Custom 404 page for portal
- `/portal/dashboard/layout.jsx` - Includes ErrorBoundary

### Global Error Pages
- `/error.jsx` - Global error page for entire application

## 🎨 Error Types & Styling

### Error Types
1. **404 - Not Found**
   - Color: Warning (Yellow)
   - Icon: Search
   - Auto-retry: No

2. **500 - Server Error**
   - Color: Danger (Red)
   - Icon: Bug
   - Auto-retry: Yes (5 seconds)

3. **403 - Forbidden**
   - Color: Secondary (Gray)
   - Icon: User
   - Auto-retry: No

4. **Network Error**
   - Color: Info (Blue)
   - Icon: Warning
   - Auto-retry: Yes

5. **Maintenance**
   - Color: Info (Blue)
   - Icon: Settings
   - Auto-retry: No

### Design Features
- **Gradient Backgrounds** - Beautiful gradient overlays
- **Animated Icons** - Large, colorful error icons
- **Card Layout** - Clean card-based design
- **Responsive Design** - Works on all devices
- **Quick Actions** - Easy navigation options
- **Auto-retry** - Automatic retry for recoverable errors

## 🔧 Usage Examples

### Basic Error Page
```jsx
import ErrorPage from "./ErrorPage";

export default function MyErrorPage() {
  return (
    <ErrorPage
      errorType="404"
      title="Page Not Found"
      message="The page you're looking for doesn't exist."
    />
  );
}
```

### Custom Error Actions
```jsx
const customActions = (
  <div className="error-actions">
    <Button onClick={handleCustomAction}>
      Custom Action
    </Button>
    <Button onClick={handleAnotherAction}>
      Another Action
    </Button>
  </div>
);

<ErrorPage
  errorType="500"
  customActions={customActions}
/>
```

### Error Boundary Usage
```jsx
import ErrorBoundary from "./ErrorBoundary";

function MyComponent() {
  return (
    <ErrorBoundary>
      <div>
        <h1>My Component</h1>
        {/* Component content that might error */}
      </div>
    </ErrorBoundary>
  );
}
```

### API Error Handling
```jsx
import { handleApiError } from "./errorUtils";

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, response);
  }
}
```

### Redirect to Error Page
```jsx
import { redirectToErrorPage, ERROR_TYPES } from "./errorUtils";

// Redirect to 404 page
redirectToErrorPage(ERROR_TYPES.NOT_FOUND);

// Redirect with custom message
redirectToErrorPage(ERROR_TYPES.SERVER_ERROR, "Custom error message");
```

## 🎯 Error Page URLs

### Portal Error Pages
- `/portal/dashboard/error?error=404` - 404 Error
- `/portal/dashboard/error?error=500` - 500 Error
- `/portal/dashboard/error?error=403` - 403 Error
- `/portal/dashboard/error?error=network` - Network Error
- `/portal/dashboard/error?error=maintenance` - Maintenance Mode

### Global Error Pages
- `/error` - Global application error
- `/portal/not-found` - Portal 404 page

## 🚀 Features

### User Experience
- **Beautiful Design** - Modern, professional error pages
- **Clear Messages** - User-friendly error descriptions
- **Helpful Actions** - Multiple recovery options
- **Quick Navigation** - Easy access to main sections
- **Auto-retry** - Automatic retry for recoverable errors

### Developer Experience
- **Easy Integration** - Simple component usage
- **Flexible Configuration** - Customizable messages and actions
- **Error Logging** - Built-in error logging capabilities
- **Type Safety** - TypeScript-ready utilities
- **Development Support** - Enhanced error details in development

### Technical Features
- **Error Boundaries** - React error boundary implementation
- **URL-based Routing** - Error pages accessible via URLs
- **State Management** - Proper error state handling
- **Responsive Design** - Mobile-friendly layouts
- **Performance** - Lightweight and fast loading

## 🔍 Testing Error Pages

### Manual Testing
1. **404 Errors** - Navigate to non-existent URLs
2. **500 Errors** - Trigger server errors
3. **Network Errors** - Disconnect internet and try actions
4. **Component Errors** - Force JavaScript errors in components

### URL Testing
```
/portal/dashboard/error?error=404
/portal/dashboard/error?error=500
/portal/dashboard/error?error=403
/portal/dashboard/error?error=network
/portal/dashboard/error?error=maintenance
```

## 📱 Responsive Design

The error pages are fully responsive and work on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

### Mobile Features
- Touch-friendly buttons
- Optimized layouts
- Readable text sizes
- Easy navigation

## 🎨 Customization

### Custom Styling
Error pages use CSS-in-JS with styled-jsx for easy customization:
- Modify colors in the style blocks
- Adjust layouts and spacing
- Add custom animations
- Change typography

### Custom Actions
Create custom action buttons:
```jsx
const customActions = (
  <div className="error-actions">
    <Button onClick={customHandler}>
      Custom Action
    </Button>
  </div>
);
```

This comprehensive error system ensures users always have a beautiful, helpful experience even when things go wrong! 🎉
