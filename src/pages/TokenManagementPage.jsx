import { useMemo, useState } from 'react'
import { Plus, Search, Ticket } from 'lucide-react'
import Button from '../components/common/Button'
import PageHeader from '../components/dashboard/PageHeader'
import QueueTable from '../components/dashboard/QueueTable'
import AddTokenModal from '../components/dashboard/AddTokenModal'
import QRCodeCard from '../components/dashboard/QRCodeCard'
import { Card, CardBody, CardHeader } from '../components/common/Card'
import { useQueueContext } from '../context/QueueContext'
import { compareTokens, formatToken } from '../utils/queueHelpers'

export default function TokenManagementPage() {
  const { clinic, queue, tokens, actions, busy } = useQueueContext()
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim()
    return [...tokens]
      .sort(compareTokens)
      .filter((token) => !query || String(token.tokenNumber).includes(query.replace('#', '')))
  }, [tokens, search])

  const nextNumber = (Number(queue?.currentTokenNumber) || 0) + 1

  return (
    <>
      <PageHeader
        title="Token management"
        description="Issue, find, recall, and manage every token in today's queue."
        actions={
          <Button onClick={() => setAddOpen(true)} disabled={busy}>
            <Plus size={16} /> Issue token
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Ticket size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next token number</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                    {formatToken(nextNumber)}
                  </p>
                </div>
              </div>
              <Button size="lg" onClick={() => setAddOpen(true)} disabled={busy}>
                <Plus size={16} /> Issue next token
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="All tokens"
              description="Actions become available based on each token's status."
              action={
                <div className="relative w-full sm:w-56">
                  <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="Find token number"
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs focus-ring focus:border-brand-400"
                  />
                </div>
              }
            />
            <CardBody className="p-0">
              <QueueTable
                tokens={filtered}
                busy={busy}
                onSkip={actions.skipToken}
                onComplete={actions.completeToken}
                onRecall={actions.recallToken}
                onAbsent={actions.markAbsent}
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <QRCodeCard slug={clinic?.publicSlug} clinicName={clinic?.name} compact />
          <Card>
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patient instructions</p>
              <ol className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                <li>1. Scan the QR code at reception.</li>
                <li>2. Enter the token number from your slip.</li>
                <li>3. Watch your position update automatically.</li>
              </ol>
            </CardBody>
          </Card>
        </div>
      </div>

      <AddTokenModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onIssue={(count) => actions.issueTokens(count)}
        nextNumber={nextNumber}
        busy={busy}
      />
    </>
  )
}
