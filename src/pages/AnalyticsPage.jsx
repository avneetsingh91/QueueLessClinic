import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, CheckCircle2, Clock3, Ticket } from 'lucide-react'
import PageHeader from '../components/dashboard/PageHeader'
import StatCard from '../components/dashboard/StatCard'
import { Card, CardBody, CardHeader } from '../components/common/Card'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import { useQueueContext } from '../context/QueueContext'
import { toDate } from '../utils/formatters'
import { TOKEN_STATUS } from '../utils/constants'
import { formatToken } from '../utils/queueHelpers'

const statusColors = {
  WAITING: '#f59e0b',
  SERVING: '#6366f1',
  COMPLETED: '#10b981',
  SKIPPED: '#94a3b8',
  CANCELLED: '#f43f5e',
}

export default function AnalyticsPage() {
  const { tokens, events, queue } = useQueueContext()

  const hourly = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      tokens: 0,
    }))
    tokens.forEach((token) => {
      const date = toDate(token.createdAt)
      if (date) buckets[date.getHours()].tokens += 1
    })
    return buckets.filter((bucket) => bucket.tokens > 0)
  }, [tokens])

  const distribution = useMemo(
    () =>
      Object.values(TOKEN_STATUS)
        .map((status) => ({
          name: status.charAt(0) + status.slice(1).toLowerCase(),
          value: tokens.filter((token) => token.status === status).length,
          color: statusColors[status],
        }))
        .filter((item) => item.value > 0),
    [tokens],
  )

  const completed = tokens.filter((token) => token.status === TOKEN_STATUS.COMPLETED)
  const serving = tokens.find((token) => token.status === TOKEN_STATUS.SERVING)

  return (
    <>
      <PageHeader title="Analytics" description="A live snapshot of today's clinic flow." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Ticket} label="Tokens issued" value={tokens.length} />
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} tone="green" />
        <StatCard icon={Activity} label="Currently serving" value={serving ? formatToken(serving.tokenNumber) : '—'} tone="slate" />
        <StatCard
          icon={Clock3}
          label="Avg. consultation"
          value={`${Math.round(Number(queue?.averageConsultationMinutes) || 8)} min`}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Token volume by hour" description="When patients are being added to the queue." />
          <CardBody>
            {hourly.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourly} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="tokens" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-20 text-center text-sm text-slate-500">No token data yet today.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Token status split" description="Current state of today's queue." />
          <CardBody>
            {distribution.length ? (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {distribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {distribution.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                      {entry.name} · {entry.value}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-20 text-center text-sm text-slate-500">No data to chart yet.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <ActivityFeed events={events} limit={12} />
      </div>
    </>
  )
}
