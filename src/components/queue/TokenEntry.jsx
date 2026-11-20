import { ArrowRight, KeyRound, QrCode } from 'lucide-react'
import Button from '../common/Button'
import { FormField, inputClass } from '../common/Feedback'

export default function TokenEntry({ value, onChange, onSubmit, error }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(Number(value))
      }}
      className="space-y-4"
    >
      <FormField label="Enter your token number" hint="You'll find it on the slip given at reception.">
        <div className="relative">
          <KeyRound size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            required
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            value={value}
            onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="e.g. 028"
            className={`${inputClass} pl-10 text-center text-lg font-bold tracking-widest`}
          />
        </div>
      </FormField>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <Button type="submit" className="w-full" size="lg">
        Track my token <ArrowRight size={16} />
      </Button>
      <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <QrCode size={13} /> No account. No app. Just your token.
      </p>
    </form>
  )
}
