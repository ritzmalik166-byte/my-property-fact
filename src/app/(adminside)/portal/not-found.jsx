import ErrorPage from "./_components/ErrorPage";

export default function PortalNotFound() {
  return (
    <ErrorPage
      errorType="404"
      title="Portal Page Not Found"
      message="The portal page you're looking for doesn't exist or has been moved to a different location."
      showRetry={false}
      showHome={true}
    />
  );
}
