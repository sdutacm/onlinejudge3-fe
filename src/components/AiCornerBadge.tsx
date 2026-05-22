import React from 'react';

export interface AiCornerBadgeProps {
  className?: string;
}

const AiCornerBadge: React.FC<AiCornerBadgeProps> = ({ className = '' }) => (
  <svg
    className={`ai-corner-badge ${className}`}
    viewBox="0 0 24 24"
    role="img"
    aria-label="AI generated"
  >
    <defs>
      <linearGradient id="ai-corner-badge-gradient" x1="3" y1="21" x2="21" y2="3">
        <stop offset="0%" stopColor="#1677ff" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      fill="url(#ai-corner-badge-gradient)"
      d="M12 1.5l2.36 7.06L21.5 12l-7.14 3.44L12 22.5l-2.36-7.06L2.5 12l7.14-3.44L12 1.5z"
    />
  </svg>
);

export default AiCornerBadge;
