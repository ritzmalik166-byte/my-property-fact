"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookie, faTimes, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./CookieConsent.css";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    // Mark component as mounted to avoid hydration mismatch
    setMounted(true);
    
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      setHasConsent(false);
    } else {
      // Load saved preferences
      const savedPreferences = JSON.parse(cookieConsent);
      setCookiePreferences(savedPreferences);
      applyCookiePreferences(savedPreferences);
      setHasConsent(true);
    }
  }, []);

  const applyCookiePreferences = (preferences) => {
    if (typeof window === "undefined") return;
    
    // Apply analytics cookies
    if (preferences.analytics) {
      // Enable Google Analytics, Facebook Pixel, etc.
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== "undefined") {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
        });
      }
    } else {
      // Disable analytics
      if (typeof window.gtag !== "undefined") {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
        });
      }
    }

    // Apply marketing cookies
    if (preferences.marketing) {
      // Enable marketing cookies
      if (typeof window.fbq !== "undefined") {
        window.fbq("consent", "grant");
      }
    } else {
      // Disable marketing
      if (typeof window.fbq !== "undefined") {
        window.fbq("consent", "revoke");
      }
    }
  };

  const handleAcceptAll = () => {
    if (typeof window === "undefined") return;
    
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    applyCookiePreferences(allAccepted);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectNonEssential = () => {
    if (typeof window === "undefined") return;
    
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setCookiePreferences(onlyNecessary);
    localStorage.setItem("cookieConsent", JSON.stringify(onlyNecessary));
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    applyCookiePreferences(onlyNecessary);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("cookieConsent", JSON.stringify(cookiePreferences));
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    applyCookiePreferences(cookiePreferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleTogglePreference = (key) => {
    if (key === "necessary") return; // Cannot disable necessary cookies
    setCookiePreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleManagePreferences = () => {
    setShowSettings(true);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (!showBanner && !showSettings) {
    // Show a small button to manage preferences if user has already consented
    if (hasConsent) {
      return (
        <div className="cookie-manage-button">
          <button
            onClick={() => setShowSettings(true)}
            className="cookie-manage-btn"
            aria-label="Manage cookie preferences"
          >
            <FontAwesomeIcon icon={faCookie} />
            <span>Cookie Settings</span>
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {showBanner && !showSettings && (
        <div className="cookie-consent-banner">
          <div className="cookie-banner-content">
            <div className="cookie-icon-wrapper">
              <FontAwesomeIcon icon={faCookie} className="cookie-icon" />
            </div>
            <div className="cookie-text-content">
              <p className="cookie-description">
                We use cookies to improve your experience. You can accept all, reject non-essential, or manage preferences.
              </p>
            </div>
            <div className="cookie-actions">
              <button
                onClick={handleRejectNonEssential}
                className="cookie-btn cookie-btn-reject"
              >
                <FontAwesomeIcon icon={faXmark} className="me-1" />
                Reject
              </button>
              <button
                onClick={handleManagePreferences}
                className="cookie-btn cookie-btn-manage"
              >
                Manage
              </button>
              <button
                onClick={handleAcceptAll}
                className="cookie-btn cookie-btn-accept"
              >
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="cookie-settings-modal">
          <div className="cookie-settings-content">
            <div className="cookie-settings-header">
              <div className="d-flex align-items-center gap-3">
                <div className="cookie-settings-icon">
                  <FontAwesomeIcon icon={faCookie} />
                </div>
                <div>
                  <h4 className="cookie-settings-title">Cookie Preferences</h4>
                  <p className="cookie-settings-subtitle">
                    Manage your cookie preferences. You can enable or disable different types of cookies below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSettings(false);
                  if (typeof window !== "undefined" && !localStorage.getItem("cookieConsent")) {
                    setShowBanner(true);
                  }
                }}
                className="cookie-close-btn"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="cookie-settings-body">
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h6 className="cookie-category-title">Necessary Cookies</h6>
                    <p className="cookie-category-desc">
                      These cookies are essential for the website to function properly. They cannot be disabled.
                    </p>
                  </div>
                  <div className="cookie-toggle disabled">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      readOnly
                      className="cookie-checkbox"
                    />
                    <span className="cookie-toggle-slider"></span>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h6 className="cookie-category-title">Analytics Cookies</h6>
                    <p className="cookie-category-desc">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>
                  <div className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={cookiePreferences.analytics}
                      onChange={() => handleTogglePreference("analytics")}
                      className="cookie-checkbox"
                    />
                    <span className="cookie-toggle-slider"></span>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h6 className="cookie-category-title">Marketing Cookies</h6>
                    <p className="cookie-category-desc">
                      These cookies are used to deliver advertisements and track campaign effectiveness. They may be set by our advertising partners.
                    </p>
                  </div>
                  <div className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={cookiePreferences.marketing}
                      onChange={() => handleTogglePreference("marketing")}
                      className="cookie-checkbox"
                    />
                    <span className="cookie-toggle-slider"></span>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h6 className="cookie-category-title">Functional Cookies</h6>
                    <p className="cookie-category-desc">
                      These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                    </p>
                  </div>
                  <div className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={cookiePreferences.functional}
                      onChange={() => handleTogglePreference("functional")}
                      className="cookie-checkbox"
                    />
                    <span className="cookie-toggle-slider"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cookie-settings-footer">
              <button
                onClick={handleRejectNonEssential}
                className="cookie-btn cookie-btn-reject"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleAcceptAll}
                className="cookie-btn cookie-btn-accept"
              >
                Accept All
              </button>
              <button
                onClick={handleSavePreferences}
                className="cookie-btn cookie-btn-save"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

