"use client";
import ErrorPage from "../../_components/ErrorPage";

export default function PortalErrorPage({ searchParams }) {
  const { error } = searchParams;
  
  // Determine error type from URL parameters
  const getErrorType = () => {
    if (error === "404") return "404";
    if (error === "500") return "500";
    if (error === "403") return "403";
    if (error === "network") return "network";
    if (error === "maintenance") return "maintenance";
    return "404"; // Default fallback
  };

  const getCustomConfig = () => {
    switch (error) {
      case "404":
        return {
          title: "Portal Page Not Found",
          message: "The portal page you're looking for doesn't exist or has been moved.",
          customActions: null
        };
      case "500":
        return {
          title: "Portal Server Error",
          message: "Something went wrong with the portal server. Our team has been notified.",
          customActions: null
        };
      case "403":
        return {
          title: "Portal Access Denied",
          message: "You don't have permission to access this portal section.",
          customActions: null
        };
      case "network":
        return {
          title: "Connection Lost",
          message: "Unable to connect to the portal server. Please check your connection.",
          customActions: null
        };
      case "maintenance":
        return {
          title: "Portal Under Maintenance",
          message: "The portal is currently under scheduled maintenance. Please try again later.",
          customActions: null
        };
      default:
        return {
          title: "Something Went Wrong",
          message: "An unexpected error occurred. Please try again.",
          customActions: null
        };
    }
  };

  const config = getCustomConfig();

  return (
    <ErrorPage
      errorType={getErrorType()}
      title={config.title}
      message={config.message}
      showRetry={error === "500" || error === "network"}
      showHome={true}
      customActions={config.customActions}
    />
  );
}
