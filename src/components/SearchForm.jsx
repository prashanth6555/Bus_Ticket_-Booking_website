import { ArrowLeftRight, Calendar, MapPin, Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cities } from '../data/travel'
import { todayISO, tomorrowISO } from '../utils/format'
import { Button, FieldError } from './ui'

function CityField({ id, label, query, onQuery, onPick, exclude, error }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const listId = useId()
  const needle = query.trim().toLowerCase()
  const matches = cities.filter((city) => city !== exclude && city.toLowerCase().includes(needle)).slice(0, 8)

  useEffect(() => {
    const close = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sea" />
        <input
          id={id}
          className={`field pl-10 ${error ? 'field-error' : ''}`}
          placeholder="City"
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const next = event.target.value
            onQuery(next)
            const exact = cities.find((city) => city.toLowerCase() === next.trim().toLowerCase())
            onPick(exact || '')
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && matches[0]) {
              event.preventDefault()
              onQuery(matches[0])
              onPick(matches[0])
              setOpen(false)
            }
            if (event.key === 'Escape') setOpen(false)
          }}
        />
      </div>
      {open && matches.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-40 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-line bg-white p-1.5 shadow-2xl">
          {matches.map((city) => (
            <li key={city}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-sand"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onQuery(city)
                  onPick(city)
                  setOpen(false)
                }}
              >
                <MapPin className="h-4 w-4 text-ember" />
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
      <FieldError>{error}</FieldError>
    </div>
  )
}

export default function SearchForm({ initial, onSearch, compact = false }) {
  const fromId = useId()
  const toId = useId()
  const dateId = useId()
  const [from, setFrom] = useState(initial?.from || '')
  const [to, setTo] = useState(initial?.to || '')
  const [fromQuery, setFromQuery] = useState(initial?.from || '')
  const [toQuery, setToQuery] = useState(initial?.to || '')
  const [date, setDate] = useState(initial?.date || tomorrowISO())
  const [errors, setErrors] = useState({})
  const [shake, setShake] = useState(false)
  const [flipped, setFlipped] = useState(false)

  const validate = (nextFrom, nextTo, nextDate) => {
    const next = {}
    if (!cities.includes(nextFrom)) next.from = 'Choose a departure city.'
    if (!cities.includes(nextTo)) next.to = 'Choose a destination city.'
    if (nextFrom && nextFrom === nextTo) next.to = 'Destination should be a different city.'
    if (!nextDate) next.date = 'Select a journey date.'
    else if (nextDate < todayISO()) next.date = 'Journey date cannot be in the past.'
    return next
  }

  const submit = (event) => {
    event.preventDefault()
    const next = validate(from, to, date)
    setErrors(next)
    if (Object.keys(next).length) {
      setShake(true)
      return
    }
    onSearch({ from, to, date })
  }

  const quick = (nextFrom, nextTo) => {
    const nextDate = date && date >= todayISO() ? date : tomorrowISO()
    setFrom(nextFrom)
    setTo(nextTo)
    setFromQuery(nextFrom)
    setToQuery(nextTo)
    setDate(nextDate)
    setErrors({})
    onSearch({ from: nextFrom, to: nextTo, date: nextDate })
  }

  return (
    <form
      onSubmit={submit}
      onAnimationEnd={() => setShake(false)}
      className={`relative z-20 w-full rounded-[28px] bg-white shadow-[0_30px_80px_-36px_rgba(12,22,40,0.65)] ${shake ? 'animate-shake' : ''} ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-start">
        <CityField id={fromId} label="From" query={fromQuery} onQuery={setFromQuery} onPick={setFrom} exclude={to} error={errors.from} />
        <button
          type="button"
          aria-label="Swap cities"
          className="mt-1 grid h-12 w-12 place-items-center self-end justify-self-center rounded-full border border-line bg-sand text-navy transition hover:rotate-180 hover:border-ember hover:text-ember md:mb-0"
          style={{ transform: flipped ? 'rotate(180deg)' : undefined }}
          onClick={() => {
            setFrom(to)
            setTo(from)
            setFromQuery(toQuery)
            setToQuery(fromQuery)
            setFlipped((value) => !value)
            setErrors({})
          }}
        >
          <ArrowLeftRight className="h-4 w-4 transition duration-300" />
        </button>
        <CityField id={toId} label="To" query={toQuery} onQuery={setToQuery} onPick={setTo} exclude={from} error={errors.to} />
        <div>
          <label htmlFor={dateId} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Journey date
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sea" />
            <input
              id={dateId}
              type="date"
              min={todayISO()}
              value={date}
              aria-invalid={Boolean(errors.date)}
              onChange={(event) => {
                setDate(event.target.value)
                setErrors((current) => ({ ...current, date: '' }))
              }}
              className={`field pl-10 ${errors.date ? 'field-error' : ''}`}
            />
          </div>
          <FieldError>{errors.date}</FieldError>
        </div>
        <div className="md:pt-[22px]">
          <Button type="submit" className="h-[54px] w-full px-6 md:w-auto">
            <Search className="h-4 w-4" />
            Search coaches
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ['Mumbai', 'Pune'],
            ['Delhi', 'Jaipur'],
            ['Bangalore', 'Chennai'],
            ['Mumbai', 'Goa'],
          ].map(([start, end]) => (
            <button
              key={`${start}-${end}`}
              type="button"
              onClick={() => quick(start, end)}
              className="rounded-full bg-sand px-3 py-1.5 text-xs font-medium text-navy transition hover:bg-foam hover:text-sea"
            >
              {start} → {end}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
