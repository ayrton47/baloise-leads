export default function DriveIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Car body */}
      <rect x="12" y="40" width="76" height="35" rx="8" fill="#2a7a6e" />
      {/* Windshield */}
      <path d="M25 40 L35 20 H65 L75 40" fill="#a8e6d5" stroke="#2a7a6e" strokeWidth="2" strokeLinejoin="round" />
      {/* Left wheel */}
      <rect x="18" y="70" width="16" height="14" rx="4" fill="#001a5c" />
      {/* Right wheel */}
      <rect x="66" y="70" width="16" height="14" rx="4" fill="#001a5c" />
      {/* Headlights */}
      <rect x="16" y="48" width="8" height="6" rx="2" fill="#a8e6d5" />
      <rect x="76" y="48" width="8" height="6" rx="2" fill="#a8e6d5" />
    </svg>
  )
}
