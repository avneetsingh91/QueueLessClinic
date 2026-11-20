import { useState } from 'react'
import { Plus, Ticket } from 'lucide-react'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { FormField, inputClass } from '../common/Feedback'
import { formatToken } from '../../utils/queueHelpers'

export default function AddTokenModal({ open, onClose, onIssue, nextNumber, busy }) {
  const [count, setCount] = useState(1)

  const issue = () => {
    onIssue(Number(count))
    setCount(1)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Issue new token"
      description="Tokens are numbered sequentially for today's queue."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={issue} loading={busy}>
            <Plus size={15} /> Issue {count === 1 ? 'token' : `${count} tokens`}
          </Button>
        </>
      }
    >
      <FormField
        label="Number of tokens"
        hint="Use this for walk-ins or patients who need more than one token."
      >
        <select value={count} onChange={(event) => setCount(event.target.value)} className={inputClass}>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </FormField>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-xs font-semibold text-brand-700">
        <Ticket size={15} />
        {count === 1
          ? `Next token: ${formatToken(nextNumber)}`
          : `Next tokens: ${formatToken(nextNumber)} – ${formatToken(Number(nextNumber) + count - 1)}`}
      </div>
    </Modal>
  )
}
