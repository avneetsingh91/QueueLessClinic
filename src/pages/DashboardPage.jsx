import { useState } from 'react'
import { ArrowRight, Clock3, Plus, Radio, Ticket, UserCheck, Users } from 'lucide-react'
import Button from '../components/common/Button'
import PageHeader from '../components/dashboard/PageHeader'
import StatCard from '../components/dashboard/StatCard'
import QueueControls from '../components/dashboard/QueueControls'
import AnnouncementPanel from '../components/dashboard/AnnouncementPanel'
import QRCodeCard from '../components/dashboard/QRCodeCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import AddTokenModal from '../components/dashboard/AddTokenModal'
import { Card, CardBody, CardHeader } from '../components/common/Card'
import { TokenStatusBadge } from '../components/common/Badge'
import { EmptyState, ErrorState } from '../components/common/States'
import { useQueueContext } from '../context/QueueContext'
import { compareTokens, formatToken } from '../utils/queueHelpers'
import { TOKEN_STATUS } from '../utils/constants'

export default function DashboardPage() {
  const { clinic, queue, tokens, events, actions, busy, error, lastAction } = useQueueContext()
  const [addOpen, setAddOpen] = useState(false)

  const waiting = tokens.filter((token) => token.status === TOKEN_STATUS.WAITING)
  const serving = tokens.find((token) => token.status === TOKEN_STATUS.SERVING)
  const completed = tokens.filter((token) => token.status === TOKEN_STATUS.COMPLETED)
  const average = Number(queue?.averageConsultationMinutes) || 8
  const next = [...waiting].sort(compareTokens)[0]

  return (
    <>
      <PageHeader
        title={`Good day${clinic?.name ? `, ${clinic.name}` : ''}`}
        description="Here's what's happening in your clinic right now."
        actions={
          <>
            <Button onClick={() => setAddOpen(true)} disabled={busy}>
              <Plus size={16} /> Issue token
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorState message={error} />
        </div>
      )}

      <div className="mb-6">
        <QueueControls
          queue={queue}
          busy={busy}
          lastAction={lastAction}
          onStatus={actions.setStatus}
          onReset={actions.resetQueue}
          onUndo={actions.undo}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Radio}
          label="Currently serving"
          value={serving ? formatToken(serving.tokenNumber) : '—'}
          hint={serving ? 'In consultation now' : 'No active consultation'}
        />
        <StatCard icon={Ticket} label="Total tokens today" value={tokens.length} hint="Issued in this queue" tone="slate" />
        <StatCard icon={Users} label="Waiting patients" value={waiting.length} hint={next ? `Next: ${formatToken(next.tokenNumber)}` : 'Queue is clear'} tone="amber" />
        <StatCard icon={UserCheck} label="Completed consultations" value={completed.length} hint="Finished today" tone="green" />
        <StatCard
          icon={Clock3}
          label="Avg. consultation"
          value={`${Math.round(average)} min`}
          hint="Rolling average, last 10"
          tone="brand"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Live queue"
              description="Up to 8 waiting and active tokens."
              action={
                <a href="/dashboard/live" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Open full queue <ArrowRight size={13} />
                </a>
              }
            />
            <CardBody className="p-0">
              {!tokens.length ? (
                <div className="p-5">
                  <EmptyState title="No tokens yet" description="Issue a token to get the queue moving." />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {[...tokens]
                    .sort(compareTokens)
                    .slice(0, 8)
                    .map((token) => (
                      <div key={token.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                            {formatToken(token.tokenNumber)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {token.status === TOKEN_STATUS.SERVING ? 'Currently with doctor' : 'In queue'}
                          </span>
                        </div>
                        <TokenStatusBadge status={token.status} />
                      </div>
                    ))}
                </div>
              )}
            </CardBody>
          </Card>

          <AnnouncementPanel
            announcement={queue?.announcement || ''}
            busy={busy}
            onPublish={actions.setAnnouncement}
          />
          <ActivityFeed events={events} />
        </div>

        <div className="space-y-6">
          <QRCodeCard slug={clinic?.publicSlug} clinicName={clinic?.name} />
          <Card>
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public queue page</p>
              <p className="mt-2 break-all text-xs text-slate-700">
                {clinic?.publicSlug ? `/queue/${clinic.publicSlug}` : 'Not available'}
              </p>
              <p className="mt-3 text-[11px] leading-5 text-slate-400">
                Patients see only token numbers, wait estimate, and announcements — never personal details.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <AddTokenModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onIssue={(count) => actions.issueTokens(count)}
        nextNumber={(Number(queue?.currentTokenNumber) || 0) + 1}
        busy={busy}
      />
    </>
  )
}
