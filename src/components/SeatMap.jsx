import { BusFront } from 'lucide-react'
import { motion } from 'framer-motion'

function sleeperRows(prefix) {
  const rows = []
  for (let i = 1; i <= 12; i += 2) rows.push([`${prefix}${i}`, `${prefix}${i + 1}`])
  return rows
}

function seaterRows() {
  const rows = []
  for (let row = 1; row <= 10; row += 1) rows.push([`${row}A`, `${row}B`, `${row}C`, `${row}D`])
  return rows
}

function SeatButton({ id, kind, gender, selected, onToggle }) {
  const booked = Boolean(gender)
  const classes = booked
    ? gender === 'F'
      ? 'cursor-not-allowed border-rose-200 bg-rose-100 text-rose-400'
      : 'cursor-not-allowed border-transparent bg-[#e7e4de] text-[#9aa3ad]'
    : selected
      ? 'border-ember bg-ember text-white shadow-[0_10px_24px_-12px_rgba(226,78,27,0.95)]'
      : 'border-white bg-white text-navy shadow-sm hover:-translate-y-0.5 hover:border-ember'

  return (
    <motion.button
      type="button"
      disabled={booked}
      aria-pressed={selected}
      aria-label={`${booked ? 'Booked' : selected ? 'Selected' : 'Available'} seat ${id}`}
      onClick={() => onToggle(id)}
      whileTap={booked ? undefined : { scale: 0.94 }}
      className={`relative grid place-items-center border-2 text-xs font-semibold transition duration-200 ${
        kind === 'sleeper' ? 'h-16 flex-1 rounded-2xl' : 'h-11 w-10 rounded-t-xl rounded-b-md sm:h-14 sm:w-12'
      } ${classes}`}
    >
      {kind === 'sleeper' && (
        <span className="absolute left-2 top-2 h-8 w-2.5 rounded-md bg-current opacity-25" aria-hidden="true" />
      )}
      {kind === 'seater' && <span className="absolute top-1 h-1 w-6 rounded-full bg-current opacity-30" aria-hidden="true" />}
      {id}
    </motion.button>
  )
}

export default function SeatMap({ layout, booked, selected, onToggle, deck, onDeck }) {
  const bookedMap = Object.fromEntries(booked.map((seat) => [seat.id, seat.gender]))
  const rows = layout === 'sleeper' ? sleeperRows(deck === 'upper' ? 'U' : 'L') : seaterRows()

  return (
    <div className="w-full rounded-[28px] border border-line bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Seat map</p>
          <h2 className="display text-3xl text-ink">{layout === 'sleeper' ? 'Choose a berth' : 'Choose a seat'}</h2>
        </div>
        {layout === 'sleeper' && (
          <div className="flex rounded-full bg-sand p-1">
            {['lower', 'upper'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onDeck(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                  deck === item ? 'bg-navy text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {item} deck
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 w-full max-w-lg rounded-[32px] bg-sand/80 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <BusFront className="h-4 w-4" /> Front of coach
          </span>
          <span className="rounded-full bg-white px-2 py-1">Door</span>
        </div>
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.join('-')} className="flex items-center justify-center gap-2 sm:gap-3">
              {layout === 'sleeper' ? (
                <>
                  <SeatButton id={row[0]} kind="sleeper" gender={bookedMap[row[0]]} selected={selected.includes(row[0])} onToggle={onToggle} />
                  <span className="w-8 shrink-0" aria-hidden="true" />
                  <SeatButton id={row[1]} kind="sleeper" gender={bookedMap[row[1]]} selected={selected.includes(row[1])} onToggle={onToggle} />
                </>
              ) : (
                <>
                  <SeatButton id={row[0]} kind="seater" gender={bookedMap[row[0]]} selected={selected.includes(row[0])} onToggle={onToggle} />
                  <SeatButton id={row[1]} kind="seater" gender={bookedMap[row[1]]} selected={selected.includes(row[1])} onToggle={onToggle} />
                  <span className="w-5 shrink-0" />
                  <SeatButton id={row[2]} kind="seater" gender={bookedMap[row[2]]} selected={selected.includes(row[2])} onToggle={onToggle} />
                  <SeatButton id={row[3]} kind="seater" gender={bookedMap[row[3]]} selected={selected.includes(row[3])} onToggle={onToggle} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap gap-3 text-xs text-muted">
        <li className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-md border border-line bg-white" /> Available</li>
        <li className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-md bg-ember" /> Selected</li>
        <li className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-md bg-[#e7e4de]" /> Booked</li>
        <li className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-md bg-rose-100" /> Booked by a woman</li>
      </ul>
    </div>
  )
}
