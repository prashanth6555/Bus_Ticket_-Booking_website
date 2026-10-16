import { Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const year = new Date().getFullYear()

const columns = [
  {
    title: 'Travel',
    links: [
      { label: 'Search coaches', to: '/search' },
      { label: 'Popular routes', to: '/#routes' },
      { label: 'Weekend offers', to: '/#offers' },
      { label: 'My trips', to: '/trips' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Create account', to: '/signup' },
      { label: 'Passenger details', to: '/booking' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="no-print w-full bg-deep text-white">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
            Intercity coaches with a calmer way to book. Pick the berth, keep the ticket, and leave the queue at the depot.
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/80">
            <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-amber" /> +91 80 4567 2100</p>
            <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-amber" /> hello@vistago.example</p>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">{column.title}</h2>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/80 transition hover:text-amber">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} VistaGo. Demo booking experience.</p>
          <p>Fares include a sample GST line and a convenience fee.</p>
        </div>
      </div>
    </footer>
  )
}
