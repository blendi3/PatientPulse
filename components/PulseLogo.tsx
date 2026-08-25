const PulseLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke="currentColor"
      strokeWidth="2"
      className="text-dark-500"
    />
    <path
      d="M6 20 H14 L17 12 L22 28 L25 20 H34"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-500"
    />
  </svg>
);

export default PulseLogo;