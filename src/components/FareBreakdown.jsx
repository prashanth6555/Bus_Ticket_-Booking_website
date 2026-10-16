import { calcFare, formatMoney } from '../utils/format'

export default function FareBreakdown({ price, count, discount = 0 }) {
  const fare = calcFare(price, count, discount)
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Base fare × {count || 0}</dt>
        <dd>{formatMoney(fare.base)}</dd>
      </div>
      {fare.discount > 0 && (
        <div className="flex justify-between gap-4 text-sea">
          <dt>Offer</dt>
          <dd>-{formatMoney(fare.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-muted">GST (5%)</dt>
        <dd>{formatMoney(fare.gst)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Convenience fee</dt>
        <dd>{formatMoney(fare.fee)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd>{formatMoney(fare.total)}</dd>
      </div>
    </dl>
  )
}
