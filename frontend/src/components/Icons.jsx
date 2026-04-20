const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const LeafIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3-3.5 18.04-8.2 17.04Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" />
  </svg>
)

export const SproutIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
)

export const SearchIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export const ChartIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="3" y1="20" x2="21" y2="20" />
  </svg>
)

export const TargetIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)

export const InfoIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

export const CameraIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
)

export const GlobeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

export const SaveIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
)

export const FolderIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

export const RefreshIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

export const CheckCircleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export const AlertTriangleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const AlertOctagonIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

export const FlaskIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M9 2v6l-5.5 9A2 2 0 0 0 5.2 20h13.6a2 2 0 0 0 1.7-3L15 8V2" /><line x1="9" y1="2" x2="15" y2="2" />
  </svg>
)

export const BugIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <rect x="8" y="6" width="8" height="14" rx="4" /><path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" /><path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" />
  </svg>
)

export const StarIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const DropletIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
)

export const SunIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

export const PotIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M4 10h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z" /><path d="M3 7h18" /><path d="M12 10V5a3 3 0 0 1 3-3" />
  </svg>
)

export const PillIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
  </svg>
)

export const ShieldIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export const WheatIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M2 22 16 8" /><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" /><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" /><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" /><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" /><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" /><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" /><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
  </svg>
)

export const FilmIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
  </svg>
)

export const RadarIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /><circle cx="8.5" cy="15.5" r="2.5" /><path d="M8.5 13.5v-5l10-2" />
  </svg>
)

export const TrendUpIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
)

export const TrendDownIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
)

export const PieIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
)

export const LightbulbIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2z" />
  </svg>
)

export const ClockIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

export const UserIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

export const ArrowUpIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
  </svg>
)

export const SquareIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
)

export const RepeatIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...base}>
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)
