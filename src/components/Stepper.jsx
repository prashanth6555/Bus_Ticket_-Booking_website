import { Check } from 'lucide-react'

const steps = ['Search', 'Seats', 'Passengers', 'Ticket']

export default function Stepper({ step, inverted = false }) {
  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-4">
      {steps.map((label, index) => {
        const number = index + 1
        const done = number < step
        const current = number === step
        return (
          <li key={label} className="min-w-0" aria-current={current ? 'step' : undefined}>
            <div className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold transition ${
                  done || current ? 'bg-ember text-white' : inverted ? 'bg-white/15 text-white' : 'bg-sand text-muted'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : number}
              </span>
              <span className={`truncate text-sm font-medium ${current ? (inverted ? 'text-white' : 'text-ink') : inverted ? 'text-white/60' : 'text-muted'}`}>
                {label}
              </span>
            </div>
            <div className={`mt-2 h-1 rounded-full ${done || current ? 'bg-ember' : inverted ? 'bg-white/20' : 'bg-line'}`} />
          </li>
        )
      })}
    </ol>
  )
}
