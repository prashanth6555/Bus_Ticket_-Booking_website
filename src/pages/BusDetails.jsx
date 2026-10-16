import { ArrowLeft, Clock, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import FareBreakdown from '../components/FareBreakdown'
import SeatMap from '../components/SeatMap'
import Stepper from '../components/Stepper'
import { Amenity, Button, FieldError } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { getBus, pointsFor, seatsLeft } from '../data/travel'
import { calcFare, formatCount, formatDate, formatMoney, formatTime } from '../utils/format'

export default function BusDetails() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const bus = getBus(id)
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const date = params.get('date') || ''
  const { draft, chooseBus, toggleSeat, setBoarding, setDropping } = useBooking()
  const [deck, setDeck] = useState('lower')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!bus) return
    const search = from && to && date ? { from, to, date } : null
    chooseBus(bus.id, search)
  }, [bus, from, to, date, chooseBus])

  if (!bus) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="display text-4xl">That coach is not on this timetable.</h1>
        <Link to="/search" className="mt-6 inline-flex rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white">
          Back to search
        </Link>
      </div>
    )
  }

  const active = draft.busId === bus.id
  const seats = active ? draft.seats : []
  const boarding = active ? draft.boarding : ''
  const dropping = active ? draft.dropping : ''
  const left = seatsLeft(bus)
  const fare = calcFare(bus.price, seats.length)

  const onToggle = (seatId) => {
    setError('')
    setNotice(toggleSeat(seatId))
  }

  const proceed = () => {
    if (!date) {
      setError('Choose a journey date from search before continuing.')
      return
    }
    if (!seats.length) {
      setError('Select at least one seat.')
      return
    }
    if (!boarding || !dropping) {
      setError('Choose where you will board and where you will get down.')
      return
    }
    navigate('/booking')
  }

  return (
    <div className="w-full bg-cream pb-28 lg:pb-16">
      <div className="w-full bg-white">
        <div className="shell py-6">
          <Stepper step={2} />
          <Link to={`/search?from=${encodeURIComponent(from || bus.from)}&to=${encodeURIComponent(to || bus.to)}&date=${date}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sea">
            <ArrowLeft className="h-4 w-4" /> All coaches
          </Link>
          <div className="mt-4 grid items-end gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold text-ember">{bus.type}</p>
              <h1 className="display text-4xl sm:text-5xl">{bus.name}</h1>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted">
                <Star className="h-4 w-4 fill-amber text-amber" />
                {bus.rating.toFixed(1)} · {formatCount(bus.reviews)} reviews · {left} seats open
              </p>
            </div>
            <div className="overflow-hidden rounded-[28px]">
              <img src="/images/bus1.jpg" alt="Close view of a coach" className="h-36 w-full object-cover" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 rounded-[28px] bg-sand p-4 sm:grid-cols-3 sm:p-5">
            <div>
              <p className="text-2xl font-semibold">{formatTime(bus.departure)}</p>
              <p className="text-sm text-muted">{bus.from}</p>
              <p className="text-sm text-navy">{date ? formatDate(date) : 'Date not set'}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted sm:justify-center">
              <Clock className="h-4 w-4" /> {bus.duration}
              {bus.dayOffset > 0 && <span className="text-ember">arrives next day</span>}
            </div>
            <div className="sm:text-right">
              <p className="text-2xl font-semibold">
                {formatTime(bus.arrival)}
                {bus.dayOffset > 0 && <span className="ml-1 text-sm text-ember">+{bus.dayOffset}</span>}
              </p>
              <p className="text-sm text-muted">{bus.to}</p>
              <p className="text-sm font-semibold">{formatMoney(bus.price)} / seat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="shell mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <SeatMap
            layout={bus.layout}
            booked={bus.booked}
            selected={seats}
            onToggle={onToggle}
            deck={deck}
            onDeck={setDeck}
          />
          <div className="flex flex-wrap gap-2">
            {bus.amenities.map((item) => (
              <Amenity key={item} name={item} />
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-[28px] border border-line bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Your booking</h2>
          <label className="mt-4 block text-sm font-medium">
            Boarding point
            <select className="field mt-1.5" value={boarding} onChange={(event) => { setBoarding(event.target.value); setError('') }}>
              <option value="">Select in {bus.from}</option>
              {pointsFor(bus.from).map((point) => (
                <option key={point} value={point}>{point}</option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium">
            Dropping point
            <select className="field mt-1.5" value={dropping} onChange={(event) => { setDropping(event.target.value); setError('') }}>
              <option value="">Select in {bus.to}</option>
              {pointsFor(bus.to).map((point) => (
                <option key={point} value={point}>{point}</option>
              ))}
            </select>
          </label>
          <div className="mt-4">
            <p className="text-sm text-muted">Selected seats</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {seats.length === 0 && <span className="text-sm text-muted">None yet</span>}
              {seats.map((seat) => (
                <button key={seat} type="button" onClick={() => onToggle(seat)} className="rounded-full bg-ember px-3 py-1 text-xs font-semibold text-white">
                  {seat} ×
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <FareBreakdown price={bus.price} count={seats.length} />
          </div>
          <FieldError>{error || notice}</FieldError>
          <div className="mt-4 hidden lg:block">
            <Button className="w-full" onClick={proceed}>
              Continue to passengers
            </Button>
          </div>
        </aside>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">{seats.length} selected</p>
            <p className="text-lg font-semibold">{formatMoney(fare.total)}</p>
          </div>
          <Button onClick={proceed}>Continue</Button>
        </div>
        {(error || notice) && <p className="mt-2 text-sm text-ember">{error || notice}</p>}
      </div>
    </div>
  )
}
