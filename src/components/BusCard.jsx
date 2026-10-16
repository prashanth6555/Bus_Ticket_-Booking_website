import { ArrowRight, Clock, Star, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { seatsLeft } from '../data/travel'
import { useBooking } from '../context/BookingContext'
import { formatCount, formatMoney, formatTime } from '../utils/format'
import { Amenity, Button } from './ui'

const tones = ['bg-ember', 'bg-sea', 'bg-navy', 'bg-[#8a4b2f]', 'bg-[#1d4e89]', 'bg-[#6b3fa0]']

function toneFor(name) {
  const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return tones[index % tones.length]
}

export default function BusCard({ bus, search }) {
  const navigate = useNavigate()
  const { chooseBus } = useBooking()
  const left = seatsLeft(bus)
  const initials = bus.name.split(' ').slice(0, 2).map((part) => part[0]).join('')

  const open = () => {
    chooseBus(bus.id, search)
    const params = new URLSearchParams(search)
    navigate(`/bus/${bus.id}?${params.toString()}`)
  }

  return (
    <article className="group w-full overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_18px_50px_-36px_rgba(16,24,40,0.8)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-32px_rgba(16,24,40,0.55)]">
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_220px] lg:items-center">
        <div>
          <div className="flex items-start gap-3">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white ${toneFor(bus.name)}`}>
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">{bus.name}</h2>
                <span className="rounded-full bg-foam px-2.5 py-1 text-xs font-semibold text-sea">{bus.type}</span>
              </div>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                <span className="font-semibold text-ink">{bus.rating.toFixed(1)}</span>
                <span>· {formatCount(bus.reviews)} reviews</span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
            <div>
              <p className="text-xl font-semibold sm:text-2xl">{formatTime(bus.departure)}</p>
              <p className="text-sm text-muted">{bus.from}</p>
            </div>
            <div className="text-center">
              <p className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                <Clock className="h-3.5 w-3.5" /> {bus.duration}
              </p>
              <div className="relative mt-2 h-px bg-line">
                <span className="absolute left-1/2 top-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ember text-[10px] text-white">
                  →
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold sm:text-2xl">
                {formatTime(bus.arrival)}
                {bus.dayOffset > 0 && <span className="ml-1 text-xs font-semibold text-ember">+{bus.dayOffset}</span>}
              </p>
              <p className="text-sm text-muted">{bus.to}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {bus.amenities.slice(0, 4).map((item) => (
              <Amenity key={item} name={item} />
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-line pt-4 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="lg:text-right">
            <p className={`inline-flex items-center gap-1 text-sm font-medium ${left <= 8 ? 'text-ember' : 'text-sea'}`}>
              <Users className="h-4 w-4" /> {left} seats left
            </p>
            <p className="mt-1 text-xs text-muted">of {bus.totalSeats}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{formatMoney(bus.price)}</p>
            <p className="text-xs text-muted">per seat</p>
          </div>
          <Button onClick={open} className="shrink-0">
            View seats <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </article>
  )
}
