"use client";
import { Modal, Accordion } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import "./PrivacyPolicyModal.css";

export default function PrivacyPolicyModal({ show, onHide }) {

  const privacySections = [
    {
      id: "1",
      title: "Scope & Roles",
      content: `• Where this applies: personal data collected via our website/app, APIs, WhatsApp and phone interactions, marketing campaigns, events, and offline data later digitised by MPF.\n\n• Role: MPF acts as a Data Fiduciary (controller) for data where it determines purposes and means. Select vendors function as Data Processors under written contracts.`
    },
    {
      id: "2",
      title: "Definitions",
      content: `• Personal Data: any data about an identifiable individual.\n\n• Data Principal: you, the individual to whom the personal data relates.\n\n• Consent Manager: a Board‑registered, user‑facing entity (if/when used) through which you may give/withdraw consent.\n\n• Child: a person under 18 years of age.`
    },
    {
      id: "3",
      title: "Data We Collect",
      content: `A. Identification & Contact - name, email, mobile number, country/state/city, WhatsApp opt‑in, OTPs.\n\nB. Role & Professional - buyer/tenant/owner/agent/developer; firm details; RERA registration (if provided).\n\nC. Listing & Transaction - property details, budgets, preferences, inquiries, site‑visit data, shortlists, feedback.\n\nD. Usage & Technical - device identifiers, IP address, timestamps, event logs, referrers/UTM, cookies/SDK telemetry, crash reports.\n\nE. Communications - emails, tickets, chat transcripts, call recordings (with notice/consent where required), IVR logs.\n\nF. Marketing & Attribution - ad interactions, lead‑form data, event RSVPs, notification choices.\n\nG. Payments (if enabled) - billing contact, invoice meta, gateway tokens/IDs (MPF does not store raw card data).\n\nH. Compliance/KYC (contextual) - documents/numbers you share (e.g., RERA/GST/PAN) to verify professional identity.`
    },
    {
      id: "4",
      title: "Sources of Data",
      content: `• You - account creation, forms, calls, chats, WhatsApp, emails, events.\n\n• Automated - cookies, SDKs, analytics, and service logs on our properties.\n\n• Partners (based on your actions) - developers, brokers/agents, channel partners, payment & analytics providers, CRM/helpdesk vendors, lead‑gen partners, and (if applicable) consent managers.`
    },
    {
      id: "5",
      title: "Lawful Grounds (DPDP)",
      content: `We process your personal data based on:\n\n- Consent - e.g., marketing communications, non‑essential cookies/SDKs.\n\n- Certain legitimate uses permitted under DPDP - e.g., providing a service you requested, preventing fraud, ensuring network security, complying with legal obligations.\n\n- Contractual necessity - to perform our agreement with you.\n\n- Legal obligations/requests - courts, law enforcement, regulators.\n\nConsent withdrawal: You may withdraw consent at any time with the same ease with which you gave it. We will honour your choice going forward.`
    },
    {
      id: "6",
      title: "Purposes of Processing",
      content: `• Core services - create and manage accounts; run searches, alerts & recommendations; publish and promote listings; match and connect buyers/tenants with owners/developers/agents; route inquiries, callbacks, WhatsApp and site‑visit requests.\n\n• Service communications - confirmations, updates, support and grievance redressal.\n\n• Quality & safety - spam/fraud/impersonation detection; platform and network security; incident logging and response as required by law.\n\n• Personalisation & analytics - experience tailoring, A/B testing, product improvement, performance measurement.\n\n• Marketing (with consent/opt‑out) - newsletters, offers, alerts, events; clear disclosures for paid/sponsored content.\n\n• Compliance - record keeping, responding to lawful requests, and other statutory duties.`
    },
    {
      id: "7",
      title: "Cookies, SDKs & Similar Tech",
      content: `We use cookies/SDKs for sign‑in, preferences, analytics, attribution, and personalisation. You will see a consent banner/manager offering Accept all, Reject non‑essential, or Manage preferences. You can also control cookies via your browser/device. Refusing some cookies may affect certain features.`
    },
    {
      id: "8",
      title: "Disclosures & Third‑Party Sharing",
      content: `We do not sell personal data. We disclose limited data, as needed, to:\n\n1. Counterparties you engage - owners, developers, brokers/agents, channel partners when you initiate contact (e.g., Call/WhatsApp/Request Callback/Arrange Site Visit).\n\n2. Service providers (processors) - hosting/CDN, CRM/helpdesk, analytics/attribution, SMS/email/WhatsApp gateways, payment processors, KYC/verification and security vendors - under contracts restricting use to our instructions with appropriate safeguards.\n\n3. Authorities/courts/law enforcement - when legally required or to protect rights, safety, or security; in accordance with due process.\n\n4. Corporate events - in a merger, acquisition, or reorganisation, data may be transferred subject to this Policy's protections.`
    },
    {
      id: "9",
      title: "Safety, Security & Incident Response",
      content: `• Administrative, technical, and organisational measures: least‑privilege access, RBAC, encrypted transit, network segmentation, vulnerability management, backups, and employee confidentiality obligations.\n\n• Logs are retained in line with law and operations (e.g., certain logs for 180 days in India); notifiable incidents may require time‑bound reporting to authorities.\n\n• If a personal data breach posing risks occurs, we will assess and notify the appropriate authority and affected users in the prescribed manner/timeframe.`
    },
    {
      id: "10",
      title: "Data Retention",
      content: `We retain personal data only as long as necessary for the purposes described or to comply with law; thereafter we delete or irreversibly anonymise it.\n\nData Category | Typical Retention\n\nAccount/profile & preferences | Life of account + limited buffer for dispute/security\n\nListings & inquiry trails | Life of listing + reasonable buffer; longer if required by law\n\nCall recordings/support chats | Operational window; longer if complaint/dispute/legal need\n\nMarketing consents/opt‑outs | While subscribed + legal record window\n\nLogs & security records | Per law/operations (e.g., ~180 days for certain logs)`
    },
    {
      id: "11",
      title: "Your Rights (India)",
      content: `Subject to verification and statutory exceptions, you can:\n\n- Access a summary of personal data processed and sharing details;\n\n- Correct/Complete/Update inaccurate or incomplete data;\n\n- Erase data no longer necessary for stated purposes or where consent is withdrawn;\n\n- Withdraw consent at any time (we will honour prospectively);\n\n- Grievance redressal via MPF's Grievance Officer; if unresolved, you may approach the Data Protection Board of India;\n\n- Nominate another person to exercise rights in case of death or incapacity.\n\nWe acknowledge grievances within 24 hours and aim to resolve within 15 days or the legally prescribed period.`
    },
    {
      id: "12",
      title: "Children's Privacy",
      content: `MPF is intended for adults (18+). We do not knowingly collect personal data from children. If a child has provided data, please contact us and we will delete it. If we ever offer teen‑specific experiences, we will obtain verifiable parental consent and avoid tracking/behavioural monitoring/targeted ads to children.`
    },
    {
      id: "13",
      title: "Marketing, Telemarketing & DND",
      content: `• We may send service messages (transactional) and, with consent/opt‑out, marketing messages via email/SMS/WhatsApp/calls.\n\n• We follow telecom consent and preference rules (e.g., DLT/DCA) and respect your opt‑outs.\n\n• You can unsubscribe via message links, reply STOP (where supported), or adjust settings in your account.`
    },
    {
      id: "14",
      title: "Automated Decision‑Making & Profiling",
      content: `We use scoring, ranking, and recommendation algorithms (e.g., search relevance, location intelligence such as LOCATE‑style scoring) to improve discovery. We do not make decisions with legal or similarly significant effects solely by automated means. You may opt out of certain personalisation where product settings allow.`
    },
    {
      id: "15",
      title: "International Data Transfers",
      content: `Some processors/vendors may handle data outside India. We use contractual and technical safeguards to ensure comparable protection and will comply with any government‑notified transfer restrictions.`
    },
    {
      id: "16",
      title: "Your Responsibilities",
      content: `Provide accurate data; avoid impersonation; refrain from frivolous or false grievances; furnish verifiable information when seeking correction/erasure; keep your credentials confidential; review updates to this Policy periodically.`
    },
    {
      id: "17",
      title: "Intermediary Due‑Diligence & Content Takedown",
      content: `Where MPF functions as an intermediary, we publish and enforce Terms/Acceptable‑Use policies; provide in‑product complaint tools; acknowledge user complaints within 24 hours and endeavour to resolve within 15 days; may remove content per legal orders/policies; and preserve records for investigations as required by law.`
    },
    {
      id: "18",
      title: "Third‑Party Links & Logins",
      content: `Our platform may contain links to third‑party sites/apps and features such as payment gateways, maps, analytics, or social logins. Their privacy practices are governed by their own policies. Review them before sharing data.`
    },
    {
      id: "19",
      title: "Reasonable Security Practices",
      content: `We adopt reasonable security practices and procedures proportionate to our risk profile and update them as regulations evolve. Where relevant, we map to recognised frameworks (e.g., ISO/IEC 27001) for controls and audits.`
    },
    {
      id: "20",
      title: "Changes to this Policy",
      content: `We may update this Policy for legal, technical, or business reasons. Material changes will be notified via the platform and/or email/in‑app notice. Please review this page periodically.`
    },
    {
      id: "21",
      title: "Contact & Grievance Redressal",
      content: `Privacy & Data Requests:\n\n- Email: privacy@mypropertyfact.in\n\n- Portal: https://mypropertyfact.in/privacy‑center (when available)\n\nGrievance Officer (India):\n\n- Name: [Insert Name]\n\n- Email: grievance@mypropertyfact.in\n\n- Address: [Registered Address, City, PIN, India]\n\n- Working Hours: Mon–Fri, 10:00–18:00 IST\n\nWe will acknowledge within 24 hours and aim to resolve within 15 days.`
    },
    {
      id: "22",
      title: "India‑Specific Quick Reference",
      content: `• DPDP: clear notices; consent withdrawal with parity of ease; user rights (access, correction, erasure, grievance, nomination).\n\n• Breach Notification: notify authority/users in prescribed manner where required.\n\n• Children: parental consent; no tracking/behavioural monitoring/targeted ads to children.\n\n• Intermediary: publish Grievance Officer; 24‑hour ack/15‑day resolution; takedown on valid orders; log preservation.\n\n• CERT‑In: incident reporting timelines; maintain certain logs within India.\n\n• Telecom (marketing): respect DND preferences and verifiable consents (DLT/DCA).\n\n• ASCI: clear labels for paid/sponsored promotions.`
    }
  ];

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="privacy-policy-modal"
      backdrop="static"
    >
      <Modal.Header className="privacy-modal-header">
        <div className="d-flex align-items-center gap-3">
          <div className="privacy-icon-wrapper">
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
          <div>
            <Modal.Title className="privacy-modal-title">
              Privacy Policy
            </Modal.Title>
            <p className="privacy-modal-subtitle mb-0">
              My Property Fact (MPF) - Effective Date: 11 November 2025
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onHide}
          aria-label="Close"
        />
      </Modal.Header>
      <Modal.Body className="privacy-modal-body">
        <div className="privacy-intro mb-4">
          <p className="mb-2">
            <strong>Legal Entity:</strong> My Property Fact (&quot;MPF&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
          </p>
          <p className="mb-0">
            <strong>Covered Properties:</strong> https://mypropertyfact.in and subdomains; Android/iOS apps; WhatsApp Business channel; emails/phone; offline forms digitised by us
          </p>
        </div>
        <p className="privacy-description mb-4">
          This Privacy Policy explains how MPF collects, uses, shares, stores, safeguards, and otherwise processes your digital personal data in India, and (where applicable) outside India when offering services to users in India. It reflects the Digital Personal Data Protection Act, 2023 (DPDP), the Information Technology Act & Intermediary Rules, CERT-In Directions, applicable telecom rules on marketing consent, and the ASCI advertising disclosure code.
        </p>

        <Accordion alwaysOpen className="privacy-accordion">
          {privacySections.map((section, index) => (
            <Accordion.Item eventKey={index.toString()} key={section.id} className="privacy-accordion-item">
              <Accordion.Header className="privacy-accordion-header">
                <div className="d-flex align-items-center justify-content-between w-100 me-3">
                  <span className="privacy-section-number">{section.id}.</span>
                  <span className="privacy-section-title">{section.title}</span>
                </div>
              </Accordion.Header>
              <Accordion.Body className="privacy-accordion-body">
                <div className="privacy-content">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-3">
                      {paragraph.split('\n').map((line, lIndex) => (
                        <span key={lIndex}>
                          {line}
                          {lIndex < paragraph.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>

        <div className="privacy-footer-info mt-4 pt-3 border-top">
          <p className="mb-2"><strong>Cookie Consent:</strong></p>
          <p className="mb-3 small">
            We use cookies and similar technologies to run our site, improve performance, and personalise your experience. You can accept all cookies, reject non‑essential cookies, or manage preferences. Your choices will be applied to this site.
          </p>
          <p className="mb-2"><strong>Privacy Center:</strong></p>
          <ul className="small mb-0">
            <li>Access your data: Request a summary of your personal data processed by MPF.</li>
            <li>Correct/Update: Ask us to fix or complete your data.</li>
            <li>Delete: Request deletion of data no longer needed or where consent is withdrawn.</li>
            <li>Marketing choices: Subscribe/unsubscribe to email/SMS/WhatsApp/calls.</li>
            <li>Cookie preferences: Update consent settings.</li>
            <li>Nominate: Appoint a nominee to exercise your rights if needed.</li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer className="privacy-modal-footer">
        <button
          type="button"
          className="btn btn-primary privacy-close-btn"
          onClick={onHide}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}

