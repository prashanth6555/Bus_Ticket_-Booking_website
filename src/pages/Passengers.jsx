import { CreditCard, Landmark, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FareBreakdown from '../components/FareBreakdown'
import Stepper from '../components/Stepper'
import { Button, FieldError } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { getBus } from '../data/travel'
import { calcFare, formatDate, formatTime, makePnr, promoDiscount } from '../utils/format'

const genders = ['Male', 'Female', 'Other']
const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank']

function formatCard(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length < 3) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function expiryValid(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  if (month < 1 || month > 12) return false
  const end = new Date(2000 + Number(match[2]), month, 1)
  return end > new Date()
}

export default function Passengers() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    draft,
    setContact,
    updatePassenger,
    setPromoCode,
    confirmBooking,
  } = useBooking()
  const bus = getBus(draft.busId)
  const seats = draft.seats
  const [method, setMethod] = useState('upi')
  const [upi, setUpi] = useState('')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [bank, setBank] = useState('')
  const [promoInput, setPromoInput] = useState(draft.promoCode)
  const [promoMessage, setPromoMessage] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState({ passengers: {}, contact: {}, payment: {}, terms: '' })
  const [shake, setShake] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    setContact({
      email: user.email,
      phone: user.phone || '',
    })
  }, [user, setContact])

  if (!bus || !seats.length || !draft.search.date) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="display text-4xl">Choose seats before the passenger list.</h1>
        <p className="mt-3 text-muted">The booking needs a coach, a date, and at least one seat.</p>
        <Link to="/search" className="mt-6 inline-flex rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white">
          Search coaches
        </Link>
      </div>
    )
  }

  const discount = promoDiscount(draft.promoCode, bus, bus.price * seats.length).discount

  const applyPromo = () => {
    const result = promoDiscount(promoInput, bus, bus.price * seats.length)
    if (!result.code) {
      setPromoCode('')
      setPromoMessage('Enter a code such as VISTA150.')
      return
    }
    if (result.error) {
      setPromoCode('')
      setPromoMessage(result.error)
      return
    }
    setPromoCode(result.code)
    setPromoMessage(`${result.code} is applied.`)
  }

  const validate = () => {
    const next = { passengers: {}, contact: {}, payment: {}, terms: '' }
    seats.forEach((seat) => {
      const person = draft.passengers[seat] || { name: '', age: '', gender: '' }
      const seatErrors = {}
      if (!/^[a-zA-Z][a-zA-Z\s'.-]{1,48}$/.test(person.name.trim())) seatErrors.name = 'Enter a full name.'
      const age = Number(person.age)
      if (!person.age || Number.isNaN(age) || age < 1 || age > 100) seatErrors.age = 'Age must be between 1 and 100.'
      if (!genders.includes(person.gender)) seatErrors.gender = 'Select a gender.'
      if (Object.keys(seatErrors).length) next.passengers[seat] = seatErrors
    })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.email.trim())) next.contact.email = 'Enter a valid email address.'
    if (!/^[6-9]\d{9}$/.test(draft.contact.phone.replace(/\D/g, ''))) next.contact.phone = 'Enter a 10-digit mobile number.'
    if (method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim())) next.payment.upi = 'Enter a UPI id like name@bank.'
    if (method === 'card') {
      if (!/^\d{16}$/.test(card.number.replace(/\s/g, ''))) next.payment.number = 'Enter a 16-digit card number.'
      if (!/^[a-zA-Z][a-zA-Z\s'.-]{1,40}$/.test(card.name.trim())) next.payment.name = 'Enter the name on the card.'
      if (!expiryValid(card.expiry)) next.payment.expiry = 'Enter a future expiry as MM/YY.'
      if (!/^\d{3}$/.test(card.cvv)) next.payment.cvv = 'Enter a 3-digit CVV.'
    }
    if (method === 'netbanking' && !bank) next.payment.bank = 'Choose a bank.'
    if (!accepted) next.terms = 'Please accept the terms to confirm.'
    return next
  }

  const invalid = (next) =>
    next.terms ||
    Object.keys(next.contact).length > 0 ||
    Object.keys(next.payment).length > 0 ||
    Object.keys(next.passengers).length > 0

  const submit = async (event) => {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (invalid(next)) {
      setShake(true)
      return
    }
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 650))
    const offer = promoDiscount(draft.promoCode, bus, bus.price * seats.length)
    const fare = calcFare(bus.price, seats.length, offer.discount)
    const booking = {
      id: makePnr(),
      createdAt: new Date().toISOString(),
      date: draft.search.date,
      from: bus.from,
      to: bus.to,
      boarding: draft.boarding,
      dropping: draft.dropping,
      paymentMethod: method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'Netbanking',
      promo: offer.code,
      bus: {
        id: bus.id,
        name: bus.name,
        type: bus.type,
        departure: bus.departure,
        arrival: bus.arrival,
        dayOffset: bus.dayOffset,
        duration: bus.duration,
        price: bus.price,
      },
      seats: [...seats],
      passengers: seats.map((seat) => ({
        seat,
        name: draft.passengers[seat].name.trim(),
        age: Number(draft.passengers[seat].age),
        gender: draft.passengers[seat].gender,
      })),
      contact: {
        email: draft.contact.email.trim(),
        phone: draft.contact.phone.replace(/\D/g, ''),
      },
      fare,
    }
    confirmBooking(booking)
    navigate(`/confirmation?id=${booking.id}`)
  }

  return (
    <div className="w-full bg-cream pb-28 lg:pb-16">
      <div className="shell py-6">
        <Stepper step={3} />
        <h1 className="display mt-6 text-4xl sm:text-5xl">Who is travelling?</h1>
        <p className="mt-2 text-muted">
          {bus.from} → {bus.to} · {formatDate(draft.search.date)} · {formatTime(bus.departure)}
        </p>
      </div>

      <form onSubmit={submit} onAnimationEnd={() => setShake(false)} className={`shell grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] ${shake ? 'animate-shake' : ''}`}>
        <div className="space-y-4">
          {seats.map((seat, index) => {
            const person = draft.passengers[seat] || { name: '', age: '', gender: '' }
            const seatErrors = errors.passengers[seat] || {}
            return (
              <section key={seat} className="rounded-[28px] border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Passenger {index + 1}</h2>
                  <span className="rounded-full bg-ember px-3 py-1 text-xs font-semibold text-white">Seat {seat}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
                  <label className="text-sm font-medium">
                    Full name
                    <input
                      className={`field mt-1.5 ${seatErrors.name ? 'field-error' : ''}`}
                      value={person.name}
                      onChange={(event) => updatePassenger(seat, { name: event.target.value })}
                      placeholder="As it should appear on the ticket"
                      aria-invalid={Boolean(seatErrors.name)}
                    />
                    <FieldError>{seatErrors.name}</FieldError>
                  </label>
                  <label className="text-sm font-medium">
                    Age
                    <input
                      className={`field mt-1.5 ${seatErrors.age ? 'field-error' : ''}`}
                      inputMode="numeric"
                      value={person.age}
                      onChange={(event) => updatePassenger(seat, { age: event.target.value.replace(/\D/g, '').slice(0, 3) })}
                      placeholder="28"
                      aria-invalid={Boolean(seatErrors.age)}
                    />
                    <FieldError>{seatErrors.age}</FieldError>
                  </label>
                </div>
                <fieldset className="mt-3">
                  <legend className="text-sm font-medium">Gender</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {genders.map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        aria-pressed={person.gender === gender}
                        onClick={() => updatePassenger(seat, { gender })}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          person.gender === gender ? 'bg-navy text-white' : 'bg-sand text-navy'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                  <FieldError>{seatErrors.gender}</FieldError>
                </fieldset>
              </section>
            )
          })}

          <section className="rounded-[28px] border border-line bg-white p-5">
            <h2 className="font-semibold">Contact</h2>
            <p className="mt-1 text-sm text-muted">The ticket is sent to this email in the confirmation screen.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Email
                <input
                  type="email"
                  className={`field mt-1.5 ${errors.contact.email ? 'field-error' : ''}`}
                  value={draft.contact.email}
                  onChange={(event) => setContact({ email: event.target.value })}
                  placeholder="you@email.com"
                  aria-invalid={Boolean(errors.contact.email)}
                />
                <FieldError>{errors.contact.email}</FieldError>
              </label>
              <label className="text-sm font-medium">
                Mobile
                <input
                  className={`field mt-1.5 ${errors.contact.phone ? 'field-error' : ''}`}
                  inputMode="numeric"
                  value={draft.contact.phone}
                  onChange={(event) => setContact({ phone: event.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="98xxxxxx21"
                  aria-invalid={Boolean(errors.contact.phone)}
                />
                <FieldError>{errors.contact.phone}</FieldError>
              </label>
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-5">
            <h2 className="font-semibold">Payment</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ['upi', 'UPI', Smartphone],
                ['card', 'Card', CreditCard],
                ['netbanking', 'Netbanking', Landmark],
              ].map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    method === id ? 'border-ember bg-[#fff4ef] text-ember' : 'border-line hover:border-navy'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            {method === 'upi' && (
              <label className="mt-4 block text-sm font-medium">
                UPI id
                <input className={`field mt-1.5 ${errors.payment.upi ? 'field-error' : ''}`} value={upi} onChange={(event) => setUpi(event.target.value)} placeholder="name@oksbi" />
                <FieldError>{errors.payment.upi}</FieldError>
              </label>
            )}
            {method === 'card' && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">
                  Card number
                  <input className={`field mt-1.5 ${errors.payment.number ? 'field-error' : ''}`} inputMode="numeric" value={card.number} onChange={(event) => setCard({ ...card, number: formatCard(event.target.value) })} placeholder="4242 4242 4242 4242" />
                  <FieldError>{errors.payment.number}</FieldError>
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Name on card
                  <input className={`field mt-1.5 ${errors.payment.name ? 'field-error' : ''}`} value={card.name} onChange={(event) => setCard({ ...card, name: event.target.value })} />
                  <FieldError>{errors.payment.name}</FieldError>
                </label>
                <label className="text-sm font-medium">
                  Expiry
                  <input className={`field mt-1.5 ${errors.payment.expiry ? 'field-error' : ''}`} value={card.expiry} onChange={(event) => setCard({ ...card, expiry: formatExpiry(event.target.value) })} placeholder="MM/YY" />
                  <FieldError>{errors.payment.expiry}</FieldError>
                </label>
                <label className="text-sm font-medium">
                  CVV
                  <input className={`field mt-1.5 ${errors.payment.cvv ? 'field-error' : ''}`} inputMode="numeric" value={card.cvv} onChange={(event) => setCard({ ...card, cvv: event.target.value.replace(/\D/g, '').slice(0, 3) })} placeholder="123" />
                  <FieldError>{errors.payment.cvv}</FieldError>
                </label>
              </div>
            )}
            {method === 'netbanking' && (
              <label className="mt-4 block text-sm font-medium">
                Bank
                <select className={`field mt-1.5 ${errors.payment.bank ? 'field-error' : ''}`} value={bank} onChange={(event) => setBank(event.target.value)}>
                  <option value="">Select a bank</option>
                  {banks.map((item) => <option key={item}>{item}</option>)}
                </select>
                <FieldError>{errors.payment.bank}</FieldError>
              </label>
            )}
            <p className="mt-3 text-xs text-muted">This is a demo checkout. Card and UPI details are checked, then discarded. Nothing is charged.</p>
          </section>
        </div>

        <aside className="h-fit rounded-[28px] border border-line bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Booking summary</h2>
          <p className="mt-2 text-sm text-muted">{bus.name} · {bus.type}</p>
          <p className="mt-1 text-sm">{draft.boarding} → {draft.dropping}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {seats.map((seat) => (
              <li key={seat} className="flex justify-between gap-3">
                <span>{draft.passengers[seat]?.name || 'Passenger'}</span>
                <span className="font-semibold">{seat}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input className="field" value={promoInput} onChange={(event) => setPromoInput(event.target.value.toUpperCase())} placeholder="Offer code" aria-label="Offer code" />
            <button type="button" onClick={applyPromo} className="rounded-2xl bg-navy px-4 text-sm font-semibold text-white">Apply</button>
          </div>
          {promoMessage && <p className={`mt-2 text-sm ${promoMessage.includes('applied') ? 'text-sea' : 'text-ember'}`}>{promoMessage}</p>}
          <div className="mt-4">
            <FareBreakdown price={bus.price} count={seats.length} discount={discount} />
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 accent-ember" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
            I confirm the passenger details and agree to the demo booking terms.
          </label>
          <FieldError>{errors.terms}</FieldError>
          <div className="mt-4 hidden lg:block">
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Confirming…' : 'Confirm booking'}
            </Button>
          </div>
        </aside>

        <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white p-4 lg:hidden">
          <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Confirming…' : 'Confirm booking'}</Button>
          {errors.terms && <p className="mt-2 text-sm text-ember">{errors.terms}</p>}
        </div>
      </form>
    </div>
  )
}
