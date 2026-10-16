import { BadgePercent, Headphones, MapPinned, ShieldCheck, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import { Button } from '../components/ui'
import { buses, cities, findBus, lowestFare, spotlights } from '../data/travel'
import { useBooking } from '../context/BookingContext'
import { formatMoney, formatTime, tomorrowISO } from '../utils/format'

const quotes = [
  {
    name: 'Ananya Rao',
    route: 'Bangalore → Kochi',
    text: 'The berth map is the first one I have used that does not feel like a spreadsheet. I knew exactly where I would sleep.',
  },
  {
    name: 'Farhan Qureshi',
    route: 'Delhi → Jaipur',
    text: 'Booked from the platform, swapped a seat once, and the ticket was already in my trips before the coach pulled in.',
  },
  {
    name: 'Meera Iyer',
    route: 'Mumbai → Goa',
    text: 'NightOwl was cheaper, Coastliner felt like a cabin. Seeing both on one page made the choice obvious.',
  },
]

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { setSearch } = useBooking()
  const highlight = findBus('Mumbai', 'Goa', 'Coastliner Premier')

  const go = (search) => {
    setSearch(search)
    navigate(`/search?from=${encodeURIComponent(search.from)}&to=${encodeURIComponent(search.to)}&date=${search.date}`)
  }

  return (
    <div className="w-full">
      <section className="relative z-10 flex min-h-[100svh] w-full items-end overflow-visible">
        <img
          src="/images/coach.jpg"
          alt="A double-decker coach parked at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/75 to-deep/20" />
        <div className="relative shell w-full pb-8 pt-32 sm:pb-12">
          <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="animate-rise text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.35)]">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                {buses.length} coaches · {cities.length} cities
              </p>
              <h1 className="display mt-5 max-w-3xl text-5xl leading-[0.95] font-semibold sm:text-6xl lg:text-7xl">
                The long way, made comfortable.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                Search a coach, claim the berth you actually want, and leave with a ticket that already knows your name.
              </p>
            </div>
            {highlight && (
              <button
                type="button"
                onClick={() => go({ from: highlight.from, to: highlight.to, date: tomorrowISO() })}
                className="animate-float hidden rounded-[28px] border border-white/20 bg-white/10 p-5 text-left text-white backdrop-blur-md transition hover:bg-white/15 lg:block"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-white/70">Tonight’s highlight</p>
                <p className="display mt-3 text-3xl">{highlight.from} → {highlight.to}</p>
                <p className="mt-2 text-sm text-white/80">{highlight.name} · {highlight.type}</p>
                <p className="mt-4 text-sm">Departs {formatTime(highlight.departure)}</p>
                <p className="mt-1 text-lg font-semibold text-amber">from {formatMoney(highlight.price)}</p>
              </button>
            )}
          </div>
          <div className="mt-8 animate-rise delay-2">
            <SearchForm onSearch={go} />
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden border-y border-line bg-sand">
        <div className="marquee flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-8 pr-8 py-4">
              {cities.map((city) => (
                <span key={`${copy}-${city}`} className="display text-lg text-navy/80">
                  {city} <span className="text-ember">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section id="routes" className="w-full bg-cream py-16 sm:py-20">
        <div className="shell">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Routes people repeat</p>
            <h2 className="display mt-2 text-4xl sm:text-5xl">Leave after dinner. Arrive somewhere vivid.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {spotlights.map((spot, index) => {
              const fare = lowestFare(spot.from, spot.to)
              return (
                <Reveal key={spot.title} delay={index * 0.05}>
                  <button
                    type="button"
                    onClick={() => go({ from: spot.from, to: spot.to, date: tomorrowISO() })}
                    className="group relative block h-72 w-full overflow-hidden rounded-[28px] text-left"
                  >
                    <img src={spot.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/70">{spot.from} → {spot.to}</p>
                      <h3 className="display text-4xl">{spot.title}</h3>
                      <p className="mt-1 text-sm text-white/80">{spot.line}</p>
                      {fare && <p className="mt-3 text-sm font-semibold text-amber">From {formatMoney(fare)}</p>}
                    </div>
                  </button>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="w-full bg-sand py-16 sm:py-20">
        <div className="shell grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-[32px]">
              <img src="/images/bus2.jpg" alt="Passengers seated inside a coach" className="h-full max-h-[520px] w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">How a booking moves</p>
            <h2 className="display mt-2 text-4xl sm:text-5xl">Three quiet steps. Then the road.</h2>
            <ol className="mt-8 space-y-5">
              {[
                ['Search the corridor', 'From, to, and a date. Coaches come back with times, berths, and a fare you can compare.'],
                ['Tap the seat', 'Sleeper decks and seater rows stay visual. Booked seats stay booked. Yours glow ember.'],
                ['Name the travellers', 'Passenger details, a fare summary, and a ticket with a PNR you can reopen later.'],
              ].map(([title, copy], index) => (
                <li key={title} className="flex gap-4">
                  <span className="display text-3xl text-ember">0{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="w-full bg-cream py-16 sm:py-20">
        <div className="shell">
          <Reveal>
            <h2 className="display text-4xl sm:text-5xl">Built for the actual journey</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              [ShieldCheck, 'Clear fares', 'Base fare, GST, and a small convenience fee. The total is on the ticket before you confirm.'],
              [MapPinned, 'Real boarding points', 'Dadar, Majestic, Sindhi Camp, Vyttila — the stop is part of the booking, not a footnote.'],
              [BadgePercent, 'Offers that apply', 'VISTA150, WELCOME, and SLEEPER10 change the summary the moment you use them.'],
              [Headphones, 'A ticket you can find', 'Confirmation lives on this device, with seats, passengers, and the PNR in one card.'],
            ].map(([Icon, title, copy]) => (
              <Reveal key={title}>
                <article className="h-full rounded-[28px] border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-foam text-sea">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="offers" className="w-full bg-navy py-16 text-white sm:py-20">
        <div className="shell">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber">Offers</p>
            <h2 className="display mt-2 text-4xl sm:text-5xl">Codes you can actually type.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              ['VISTA150', '₹150 off', 'Any coach, once the base fare covers it.'],
              ['WELCOME', '₹100 off', 'For the first ticket you try in this demo.'],
              ['SLEEPER10', '10% off sleepers', 'Platinum, Coastliner, and NightOwl only.'],
            ].map(([code, title, copy]) => (
              <article key={code} className="rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
                <p className="text-sm text-amber">{title}</p>
                <p className="display mt-3 text-4xl">{code}</p>
                <p className="mt-3 text-sm leading-6 text-white/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-cream py-16 sm:py-20">
        <div className="shell grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="relative h-full min-h-80 overflow-hidden rounded-[32px]">
              <img src="/images/udaipur.jpg" alt="Amber Fort in Jaipur above the water" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/80 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.16em] text-white/70">Delhi → Jaipur</p>
                <h2 className="display text-4xl">Amber Fort is a sunrise away.</h2>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <Reveal key={quote.name}>
                <figure className="rounded-[28px] border border-line bg-white p-6">
                  <div className="flex gap-1 text-amber">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-amber" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-base leading-7 text-navy">“{quote.text}”</blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold">{quote.name}</span>
                    <span className="text-muted"> · {quote.route}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative w-full min-h-[420px]">
        <img src="/images/road.jpg" alt="An open highway through red rock" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-deep/70" />
        <div className="relative shell flex min-h-[420px] flex-col items-start justify-center py-16 text-white">
          <h2 className="display max-w-2xl text-5xl sm:text-6xl">Pick a seat before the city does.</h2>
          <p className="mt-4 max-w-lg text-white/80">Mumbai to Pune takes an evening. Delhi to Jaipur takes a night. The booking should take a minute.</p>
          <Button className="mt-8" onClick={() => document.getElementById('main')?.querySelector('input')?.focus()}>
            Start with a city
          </Button>
        </div>
      </section>
    </div>
  )
}
