export function toISODate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function todayISO() {
  return toISODate(new Date())
}

export function tomorrowISO() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

export function shiftDate(iso, days) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function formatDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCount(count) {
  if (count >= 1000) {
    const value = count / 1000
    return `${value.toFixed(value >= 10 ? 0 : 1).replace(/\.0$/, '')}k`
  }
  return String(count)
}

export function calcFare(price, count, discount = 0) {
  const base = price * count
  const off = Math.min(Math.max(discount, 0), base)
  const taxable = base - off
  const gst = Math.round(taxable * 0.05)
  const fee = count ? 29 : 0
  return { base, discount: off, gst, fee, total: taxable + gst + fee }
}

export function promoDiscount(code, bus, base) {
  const normalized = (code || '').trim().toUpperCase()
  if (!normalized) return { code: '', discount: 0, error: '' }
  if (normalized === 'VISTA150') return { code: normalized, discount: Math.min(150, base), error: '' }
  if (normalized === 'WELCOME') return { code: normalized, discount: Math.min(100, base), error: '' }
  if (normalized === 'SLEEPER10') {
    if (!/sleeper/i.test(bus?.type || '')) {
      return { code: normalized, discount: 0, error: 'SLEEPER10 works on sleeper coaches only.' }
    }
    return { code: normalized, discount: Math.round(base * 0.1), error: '' }
  }
  return { code: normalized, discount: 0, error: 'That code is not recognised.' }
}

export function makePnr() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let value = 'VG'
  for (let i = 0; i < 6; i += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return value
}
