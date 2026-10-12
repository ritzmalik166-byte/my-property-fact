export function DiyaIcon({ size = 16, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2.2c1.9 2.4 2.8 4.1 2.8 5.5A2.8 2.8 0 0 1 12 10.6a2.8 2.8 0 0 1-2.8-2.9c0-1.4.9-3.1 2.8-5.5z"
        fill="#ffd43b"
      />
      <path
        d="M12 5.4c.8 1.1 1.2 1.9 1.2 2.5a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.4 1.2-2.5z"
        fill="#ff922b"
      />
      <path
        d="M2.6 12.4h18.8c-.5 4.5-4.5 8-9.4 8s-8.9-3.5-9.4-8z"
        fill="#e8590c"
      />
      <path d="M2.6 12.4h18.8c-.1.8-.3 1.5-.6 2.2H3.2c-.3-.7-.5-1.4-.6-2.2z" fill="#fab005" />
    </svg>
  );
}

export function SparkleIcon({ size = 12, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5l2.2 7.3 7.3 2.2-7.3 2.2L12 20.5l-2.2-7.3L2.5 11l7.3-2.2z" />
      <path d="M19.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" opacity="0.7" />
    </svg>
  );
}

export function PinIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
