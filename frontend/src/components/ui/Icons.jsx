/**
 * src/components/ui/Icons.jsx
 *
 * Small line-icon set (24x24, stroke-based, currentColor) used by the admin
 * chrome (Sidebar nav, StatsCards). Kept as plain inline SVG — no icon
 * library dependency — so every icon inherits text color and sizes with
 * font-size like a glyph.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function DashboardIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.8" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.8" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.8" />
    </svg>
  );
}

export function OrdersIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h9l3.5 3.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5Z" />
      <path d="M14.5 3.5V7a1.5 1.5 0 0 0 1.5 1.5h3.5" />
      <path d="M8 12.5h8M8 16h8" />
    </svg>
  );
}

export function PlusCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.2v7.6M8.2 12h7.6" />
    </svg>
  );
}

export function PackageIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 4.5 7.5v9L12 20.5l7.5-4v-9L12 3.5Z" />
      <path d="M4.5 7.5 12 11.5l7.5-4M12 11.5v9" />
    </svg>
  );
}

export function SignalIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 18h1.6v-4H4v4Zm4.7 0h1.6V11H8.7v7Zm4.7 0h1.6V7.5h-1.6V18Zm4.7 0h1.6V4h-1.6v14Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5.5 15.5 12 9 18.5" />
    </svg>
  );
}
