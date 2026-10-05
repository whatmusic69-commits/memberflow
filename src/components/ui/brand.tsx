export function FlowMark({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 24 : 32}
      height={small ? 24 : 32}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 24V8a3 3 0 0 1 6 0v11a3 3 0 0 0 6 0V13a3 3 0 0 1 6 0v11"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="26" cy="7" r="3" fill="var(--accent)" />
    </svg>
  );
}
export function Wordmark() {
  return (
    <span className="wordmark">
      <FlowMark />
      Member<span>Flow</span>
    </span>
  );
}
