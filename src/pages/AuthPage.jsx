import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, FieldError } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { user, login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = location.state?.from && location.state.from !== '/login' && location.state.from !== '/signup'
    ? location.state.from
    : '/'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [show, setShow] = useState(false)
  const [shake, setShake] = useState(false)

  if (user) return <Navigate to={destination} replace />

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: '' }))
    setFormError('')
  }

  const validate = () => {
    const next = {}
    if (!isLogin && !/^[a-zA-Z][a-zA-Z\s'.-]{1,40}$/.test(form.name.trim())) next.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email.'
    if (!isLogin && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))) next.phone = 'Enter a 10-digit mobile number.'
    if (form.password.length < 6) next.password = 'Use at least 6 characters.'
    if (!isLogin && form.confirm !== form.password) next.confirm = 'Passwords do not match.'
    return next
  }

  const submit = (event) => {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) {
      setShake(true)
      return
    }
    const result = isLogin
      ? login({ email: form.email, password: form.password })
      : signup({
          name: form.name,
          email: form.email,
          phone: form.phone.replace(/\D/g, ''),
          password: form.password,
        })
    if (!result.ok) {
      setFormError(result.error)
      setShake(true)
      return
    }
    navigate(destination)
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] w-full lg:grid-cols-2">
      <div className="relative min-h-56 lg:min-h-full">
        <img src="/images/udaipur.jpg" alt="Amber Fort above the water at golden hour" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/35 to-deep/10" />
        <div className="relative flex h-full items-end p-6 text-white sm:p-10 lg:p-12">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">VistaGo accounts</p>
            <h1 className="display mt-3 max-w-md text-4xl sm:text-6xl">Leave after dinner. Arrive before the city wakes.</h1>
          </div>
        </div>
      </div>
      <div className="flex items-center bg-cream px-4 py-10 sm:px-8 lg:px-12">
        <form onSubmit={submit} onAnimationEnd={() => setShake(false)} className={`w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember">{isLogin ? 'Welcome back' : 'New here'}</p>
          <h2 className="display mt-2 text-4xl">{isLogin ? 'Log in' : 'Create an account'}</h2>
          <p className="mt-2 text-sm text-muted">
            {isLogin ? 'Use the email you signed up with on this device.' : 'Your trips stay attached to this browser.'}
          </p>
          {formError && <p className="mt-4 rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-ember" role="alert">{formError}</p>}
          <div className="mt-6 space-y-3">
            {!isLogin && (
              <label className="block text-sm font-medium">
                Full name
                <input className={`field mt-1.5 ${errors.name ? 'field-error' : ''}`} value={form.name} onChange={set('name')} placeholder="Priya Sharma" />
                <FieldError>{errors.name}</FieldError>
              </label>
            )}
            <label className="block text-sm font-medium">
              Email
              <input type="email" className={`field mt-1.5 ${errors.email ? 'field-error' : ''}`} value={form.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" />
              <FieldError>{errors.email}</FieldError>
            </label>
            {!isLogin && (
              <label className="block text-sm font-medium">
                Mobile
                <input className={`field mt-1.5 ${errors.phone ? 'field-error' : ''}`} inputMode="numeric" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="98xxxxxx21" />
                <FieldError>{errors.phone}</FieldError>
              </label>
            )}
            <label className="block text-sm font-medium">
              Password
              <span className="relative mt-1.5 block">
                <input type={show ? 'text' : 'password'} className={`field pr-12 ${errors.password ? 'field-error' : ''}`} value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" onClick={() => setShow((value) => !value)} aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
              <FieldError>{errors.password}</FieldError>
            </label>
            {!isLogin && (
              <label className="block text-sm font-medium">
                Confirm password
                <input type={show ? 'text' : 'password'} className={`field mt-1.5 ${errors.confirm ? 'field-error' : ''}`} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
                <FieldError>{errors.confirm}</FieldError>
              </label>
            )}
          </div>
          <Button type="submit" className="mt-6 w-full">{isLogin ? 'Log in' : 'Create account'}</Button>
          <p className="mt-4 text-sm text-muted">
            {isLogin ? 'New to VistaGo?' : 'Already have an account?'}{' '}
            <Link to={isLogin ? '/signup' : '/login'} state={{ from: destination }} className="font-semibold text-ember">
              {isLogin ? 'Create an account' : 'Log in'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
