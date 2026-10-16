export default function Logo({ light = false, compact = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-ink'}`}>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ember text-white shadow-[0_10px_24px_-12px_rgba(226,78,27,0.9)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <rect x="2" y="10" width="20" height="11" rx="3" fill="currentColor" />
          <path d="M21 13h7.2c.7 0 1.3.4 1.6 1l1.2 2.6V21h-10V13z" fill="#f0a202" />
          <circle cx="9" cy="23.5" r="2.2" fill={light ? '#0c1628' : '#faf7f2'} />
          <circle cx="22" cy="23.5" r="2.2" fill={light ? '#0c1628' : '#faf7f2'} />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="display block text-[1.35rem] font-semibold tracking-tight">VistaGo</span>
          <span className={`mt-1 block text-[10px] uppercase tracking-[0.18em] ${light ? 'text-white/70' : 'text-muted'}`}>
            Coach travel
          </span>
        </span>
      )}
    </span>
  )
}
