'use client'

import ContactForm from "./ContactForm"

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="footer-about">
                <h4 className="footer-heading">About Eldeco Group</h4>
                <p className="footer-text">
                  With over four decades of expertise, Eldeco has been a pioneer in North India&apos;s real estate landscape, known for its residential projects in Noida, Greater Noida and other cities. Having successfully delivered 200+ projects across 20+ cities, Eldeco has served over 30000+ satisfied homeowners, and developed 60+ million sq.ft.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="footer-form-wrapper">
                <h4 className="footer-heading">Schedule A Site Visit</h4>
                <p className="footer-subtext">Fill in your details and we&apos;ll get back to you</p>
                <ContactForm formType="footer" />
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright-text">
              <a href="#" className="footer-link">Privacy Policy</a>
              <span className="separator">|</span>
              Digital Media Planned By{' '}
              <a href="https://ritzmediaworld.com" className="footer-link" target="_blank" rel="noopener noreferrer">
                Ritz Media World
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
