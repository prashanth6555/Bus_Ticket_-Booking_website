import { SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BusCard from '../components/BusCard'
import SearchForm from '../components/SearchForm'
import Stepper from '../components/Stepper'
import { searchBuses, slotMeta, timeSlot } from '../data/travel'
import { useBooking } from '../context/BookingContext'
import { formatDate } from '../utils/format'

export default function SearchResults() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setSearch } = useBooking()
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const date = params.get('date') || ''
  const ready = Boolean(from && to && date)

  const routeBuses = useMemo(() => (ready ? searchBuses(from, to) : []), [from, to, ready])
  const priceCap = routeBuses.length ? Math.max(...routeBuses.map((bus) => bus.price)) : 2000
  const routeKey = `${from}|${to}`
  const [filterKey, setFilterKey] = useState(routeKey)
  const [types, setTypes] = useState([])
  const [slots, setSlots] = useState([])
  const [maxPrice, setMaxPrice] = useState(priceCap)
  const [sort, setSort] = useState('departure')
  const [showFilters, setShowFilters] = useState(false)

  if (filterKey !== routeKey) {
    setFilterKey(routeKey)
    setTypes([])
    setSlots([])
    setMaxPrice(priceCap)
    setSort('departure')
  }

  const typeOptions = [...new Set(routeBuses.map((bus) => bus.type))]

  const results = routeBuses
    .filter((bus) => (types.length ? types.includes(bus.type) : true))
    .filter((bus) => (slots.length ? slots.includes(timeSlot(bus.departure)) : true))
    .filter((bus) => bus.price <= maxPrice)
    .sort((a, b) => {
      if (sort === 'price') return a.price - b.price
      if (sort === 'duration') return a.durationMin - b.durationMin
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'seats') return (b.totalSeats - b.booked.length) - (a.totalSeats - a.booked.length)
      return a.departure.localeCompare(b.departure)
    })

  const toggle = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  const go = (search) => {
    setSearch(search)
    navigate(`/search?from=${encodeURIComponent(search.from)}&to=${encodeURIComponent(search.to)}&date=${search.date}`)
  }

  return (
    <div className="w-full bg-cream pb-16">
      <div className="w-full bg-navy text-white">
        <div className="shell py-8">
          <Stepper step={1} inverted />
          <h1 className="display mt-6 text-4xl sm:text-5xl">
            {ready ? `${from} to ${to}` : 'Where are you headed?'}
          </h1>
          <p className="mt-2 text-white/70">{ready ? formatDate(date) : 'Choose a route and a date to see coaches.'}</p>
          <div className="mt-6">
            <SearchForm key={routeKey + date} compact initial={{ from, to, date }} onSearch={go} />
          </div>
        </div>
      </div>

      <div className="shell mt-6">
        {!ready && (
          <div className="rounded-[28px] border border-dashed border-line bg-white p-10 text-center">
            <p className="display text-3xl">The map is waiting on two cities.</p>
            <p className="mt-2 text-muted">Try Mumbai to Pune, or Delhi to Jaipur.</p>
          </div>
        )}

        {ready && routeBuses.length === 0 && (
          <div className="rounded-[28px] bg-white p-10 text-center">
            <p className="display text-3xl">No coaches on this corridor yet.</p>
            <p className="mt-2 text-muted">Pick one of the quick routes on the home page.</p>
          </div>
        )}

        {ready && routeBuses.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="rounded-[28px] border border-line bg-white p-5 lg:sticky lg:top-24">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Filters</h2>
                  <button
                    type="button"
                    className="text-xs font-semibold text-ember"
                    onClick={() => {
                      setTypes([])
                      setSlots([])
                      setMaxPrice(priceCap)
                    }}
                  >
                    Clear
                  </button>
                </div>
                <fieldset className="mt-5">
                  <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Coach type</legend>
                  <div className="mt-3 space-y-2">
                    {typeOptions.map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={types.includes(type)}
                          onChange={() => toggle(types, setTypes, type)}
                          className="h-4 w-4 accent-ember"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-5">
                  <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Departure</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {slotMeta.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => toggle(slots, setSlots, slot.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          slots.includes(slot.id) ? 'bg-navy text-white' : 'bg-sand text-navy'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Max fare {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(maxPrice)}
                  <input
                    type="range"
                    min={Math.min(...routeBuses.map((bus) => bus.price))}
                    max={priceCap}
                    step={10}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="mt-3 w-full"
                  />
                </label>
              </div>
            </aside>

            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">{results.length} coaches</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold lg:hidden"
                    onClick={() => setShowFilters((value) => !value)}
                  >
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                  </button>
                  <label className="text-sm text-muted">
                    Sort
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                      className="ml-2 rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink"
                    >
                      <option value="departure">Departure</option>
                      <option value="price">Price</option>
                      <option value="duration">Duration</option>
                      <option value="rating">Rating</option>
                      <option value="seats">Seats left</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                {results.length === 0 && (
                  <div className="rounded-[28px] bg-white p-8 text-center">
                    <p className="font-semibold">Nothing matches these filters.</p>
                    <p className="mt-1 text-sm text-muted">Widen the fare or clear a coach type.</p>
                  </div>
                )}
                {results.map((bus) => (
                  <BusCard key={bus.id} bus={bus} search={{ from, to, date }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
