export default function PensionIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stem */}
      <rect x="46" y="35" width="8" height="45" rx="2" fill="#2a7a6e" />
      {/* Right leaf (dark teal) */}
      <path d="M50 45 C50 20 85 15 85 15 C85 15 80 50 50 45Z" fill="#2a7a6e" />
      {/* Left leaf (light mint) */}
      <path d="M50 55 C50 35 20 28 20 28 C20 28 22 60 50 55Z" fill="#a8e6d5" />
      {/* Pot */}
      <rect x="35" y="80" width="30" height="12" rx="2" fill="#001a5c" />
    </svg>
  )
}
