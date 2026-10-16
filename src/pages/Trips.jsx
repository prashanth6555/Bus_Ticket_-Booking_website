import { Ticket, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { formatDate, formatMoney, formatTime } from '../utils/format'

export default function Trips() {
  const { bookings, removeBooking } = useBooking()

  return (
    <div className="w-full bg-cream pb-16">
      <div className="shell py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember">Saved on this device</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">My trips</h1>
        {bookings.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-line bg-white p-10 text-center">
            <Ticket className="mx-auto h-8 w-8 text-ember" />
            <p className="display mt-4 text-3xl">No tickets yet.</p>
            <p className="mt-2 text-muted">A confirmed booking will wait for you here.</p>
            <Link to="/" className="mt-6 inline-flex rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white">Find a coach</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="grid gap-4 rounded-[28px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{booking.id}</p>
                  <h2 className="mt-1 text-2xl font-semibold">{booking.from} → {booking.to}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(booking.date)} · {formatTime(booking.bus.departure)} · {booking.bus.name}
                  </p>
                  <p className="mt-2 text-sm">Seats {booking.seats.join(', ')} · {booking.passengers.map((person) => person.name).join(', ')}</p>
                </div>
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                  <p className="text-xl font-semibold">{formatMoney(booking.fare.total)}</p>
                  <div className="flex gap-2">
                    <Link to={`/confirmation?id=${booking.id}`} className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
                      View ticket
                    </Link>
                    <button type="button" onClick={() => removeBooking(booking.id)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:text-ember" aria-label={`Remove ${booking.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
