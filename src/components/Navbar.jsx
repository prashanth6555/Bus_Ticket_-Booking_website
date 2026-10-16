import { Menu, Ticket, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { Button } from './ui'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Coaches' },
  { to: '/trips', label: 'My trips' },
  { to: '/#offers', label: 'Offers' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const home = location.pathname === '/'
  const pathKey = `${location.pathname}${location.hash}`
  const [openPath, setOpenPath] = useState(pathKey)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8)

  if (openPath !== pathKey) {
    setOpenPath(pathKey)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const clear = home && !scrolled && !open

  return (
    <header className={`no-print sticky top-0 z-50 w-full transition duration-300 ${clear ? 'bg-transparent' : 'border-b border-line/80 bg-cream/95 shadow-[0_10px_40px_-28px_rgba(16,24,40,0.7)] backdrop-blur-md'}`}>
      <div className="shell flex h-[72px] items-center justify-between gap-4">
        <Link to="/" aria-label="VistaGo home" className="shrink-0">
          <Logo light={clear} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) =>
            link.to.includes('#') ? (
              <a
                key={link.label}
                href={link.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/10 ${clear ? 'text-white/90 hover:text-white' : 'text-navy hover:bg-sand'}`}
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? clear
                        ? 'bg-white/15 text-white'
                        : 'bg-navy text-white'
                      : clear
                        ? 'text-white/90 hover:bg-white/10 hover:text-white'
                        : 'text-navy hover:bg-sand'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link to="/trips" className={`rounded-full px-3 py-2 text-sm font-medium ${clear ? 'text-white' : 'text-navy'}`}>
                {user.name.split(' ')[0]}
              </Link>
              <Button variant={clear ? 'light' : 'ghost'} onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${clear ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-sand'}`}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                state={{ from: location.pathname }}
                className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(226,78,27,0.95)] transition hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${clear ? 'text-white' : 'bg-white text-ink'}`}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-cream lg:hidden">
          <nav className="shell flex flex-col gap-1 py-4" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="rounded-2xl px-4 py-3 text-base font-medium text-navy hover:bg-sand"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2">
              {user ? (
                <Button variant="ghost" onClick={logout}>Log out</Button>
              ) : (
                <>
                  <Link to="/login" className="rounded-full border border-line bg-white px-5 py-3 text-center text-sm font-semibold">
                    Log in
                  </Link>
                  <Link to="/signup" className="rounded-full bg-ember px-5 py-3 text-center text-sm font-semibold text-white">
                    Sign up
                  </Link>
                </>
              )}
              <Link to="/trips" className="inline-flex items-center justify-center gap-2 py-2 text-sm text-muted">
                <Ticket className="h-4 w-4" /> My trips
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
