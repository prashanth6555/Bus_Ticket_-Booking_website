import { Check, Printer } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import Stepper from '../components/Stepper'
import { Button } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { formatDate, formatMoney, formatTime } from '../utils/format'

function Mark({ value }) {
  const seed = value.split('').reduce((sum, char, index) => (sum + char.charCodeAt(0) * (index + 3)) % 997, 7)
  const cells = Array.from({ length: 49 }, (_, index) => ((seed * (index + 5) * 17) % 5) > 1)
  return (
    <div className="grid grid-cols-7 gap-0.5 rounded-xl bg-white p-2" aria-hidden="true">
      {cells.map((on, index) => (
        <span key={index} className={`h-2.5 w-2.5 ${on ? 'bg-ink' : 'bg-sand'}`} />
      ))}
    </div>
  )
}

export default function Confirmation() {
  const [params] = useSearchParams()
  const { bookings, lastBookingId } = useBooking()
  const id = params.get('id') || lastBookingId
  let booking = bookings.find((item) => item.id === id)
  if (!booking) {
    try {
      const cached = JSON.parse(sessionStorage.getItem('vistago-last-booking') || 'null')
      if (cached && (!id || cached.id === id)) booking = cached
    } catch {
      booking = null
    }
  }

  if (!booking) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="display text-4xl">No ticket to show yet.</h1>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white">Plan a journey</Link>
      </div>
    )
  }

  return (
    <div className="w-full bg-sand pb-16">
      <div className="shell py-8">
        <div className="no-print">
          <Stepper step={4} />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 16 }}
            className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-full bg-sea text-white"
          >
            <Check className="h-10 w-10" />
          </motion.div>
          <h1 className="display mt-4 text-center text-4xl sm:text-5xl">You are booked.</h1>
          <p className="mx-auto mt-2 max-w-lg text-center text-muted">
            Show this ticket on your phone. The PNR is enough if the conductor asks.
          </p>
        </div>

        <article className="ticket relative mx-auto mt-8 w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(16,24,40,0.55)]">
          <div className="bg-deep px-6 py-6 text-white sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="display text-2xl">VistaGo</p>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Confirmed</span>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/50">PNR</p>
            <p className="display text-4xl sm:text-5xl">{booking.id}</p>
          </div>
          <div className="relative px-6 py-6 sm:px-8">
            <span className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-sand" />
            <span className="absolute -right-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-sand" />
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-sm text-muted">{formatDate(booking.date)}</p>
                <p className="display mt-1 text-4xl">{booking.from} → {booking.to}</p>
                <p className="mt-2 text-sm text-muted">
                  {formatTime(booking.bus.departure)} – {formatTime(booking.bus.arrival)}
                  {booking.bus.dayOffset > 0 ? ' next day' : ''} · {booking.bus.duration}
                </p>
                <p className="mt-1 text-sm">{booking.bus.name} · {booking.bus.type}</p>
              </div>
              <Mark value={booking.id} />
            </div>
            <div className="my-6 border-t border-dashed border-line" />
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm"><span className="block text-xs uppercase tracking-[0.14em] text-muted">Boarding</span>{booking.boarding}</p>
              <p className="text-sm"><span className="block text-xs uppercase tracking-[0.14em] text-muted">Dropping</span>{booking.dropping}</p>
              <p className="text-sm"><span className="block text-xs uppercase tracking-[0.14em] text-muted">Seats</span>{booking.seats.join(', ')}</p>
              <p className="text-sm"><span className="block text-xs uppercase tracking-[0.14em] text-muted">Paid via</span>{booking.paymentMethod}</p>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-sand text-xs uppercase tracking-[0.12em] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Passenger</th>
                    <th className="px-4 py-3 font-semibold">Seat</th>
                    <th className="px-4 py-3 font-semibold">Age</th>
                    <th className="px-4 py-3 font-semibold">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.passengers.map((person) => (
                    <tr key={person.seat} className="border-t border-line">
                      <td className="px-4 py-3 font-medium">{person.name}</td>
                      <td className="px-4 py-3">{person.seat}</td>
                      <td className="px-4 py-3">{person.age}</td>
                      <td className="px-4 py-3">{person.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="text-sm text-muted">
                <p>{booking.contact.email}</p>
                <p>{booking.contact.phone}</p>
                {booking.promo && <p className="mt-1 text-sea">Offer {booking.promo}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Total fare</p>
                <p className="display text-4xl">{formatMoney(booking.fare.total)}</p>
              </div>
            </div>
          </div>
        </article>

        <div className="no-print mx-auto mt-6 flex w-full max-w-3xl flex-wrap gap-3">
          <Button variant="dark" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print ticket
          </Button>
          <Link to="/trips" className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold">
            My trips
          </Link>
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white">
            Book another
          </Link>
        </div>
      </div>
    </div>
  )
}
