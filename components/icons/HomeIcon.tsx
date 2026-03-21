export default function HomeIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* House body */}
      <rect x="15" y="45" width="65" height="50" rx="2" fill="#b3b3ff" />
      {/* Roof */}
      <path d="M10 48 L48 12 L85 48" stroke="#001a5c" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Chimney */}
      <rect x="68" y="15" width="12" height="25" rx="1" fill="#4a1a6b" />
    </svg>
  )
}
