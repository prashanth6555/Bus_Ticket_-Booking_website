import { Armchair, BedDouble, Cookie, GlassWater, Lamp, Monitor, Navigation, Sparkles, Wifi, Zap } from 'lucide-react'

const amenityIcons = {
  'Wi-Fi': Wifi,
  'Charging port': Zap,
  'Blanket': BedDouble,
  'Water bottle': GlassWater,
  'Live tracking': Navigation,
  'Reading light': Lamp,
  Snack: Cookie,
  'Personal screen': Monitor,
  Recliner: Armchair,
}

export function Amenity({ name }) {
  const Icon = amenityIcons[name] || Sparkles
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-navy">
      <Icon className="h-3.5 w-3.5 text-sea" aria-hidden="true" />
      {name}
    </span>
  )
}

const buttonStyles = {
  primary:
    'bg-ember text-white shadow-[0_12px_30px_-14px_rgba(226,78,27,0.95)] hover:bg-[#cf4316]',
  sea: 'bg-sea text-white hover:bg-[#0c5c57]',
  dark: 'bg-ink text-white hover:bg-navy',
  ghost: 'border border-line bg-white text-ink hover:border-ink/30',
  light: 'bg-white text-ink hover:bg-sand',
}

export function Button({ children, className = '', variant = 'primary', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-sm text-ember">{children}</p>
}

export function Photo({ src, alt, className = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.style.display = 'none'
      }}
    />
  )
}
