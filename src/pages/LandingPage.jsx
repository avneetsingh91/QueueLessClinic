import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Layers3,
  Megaphone,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'

const steps = [
  {
    icon: QrCode,
    title: 'Scan at reception',
    text: 'Your clinic displays one QR code at the front desk. Scan it with any phone camera — no download, no sign-up.',
  },
  {
    icon: ScanLine,
    title: 'Enter your token',
    text: 'Type the token number printed on your receipt. The page remembers it on your device for the rest of the visit.',
  },
  {
    icon: BellRing,
    title: 'Watch it move in real time',
    text: 'See who is being served, how many people are ahead of you, and when you should head back.',
  },
]

const features = [
  { icon: Layers3, title: 'Multi-tenant by design', text: 'Every clinic gets an isolated queue, staff team, public link, and settings.' },
  { icon: Clock3, title: 'Smart wait estimates', text: 'Live estimates improve as completed consultations feed a rolling average.' },
  { icon: Megaphone, title: 'Instant announcements', text: 'Broadcast breaks, delays, or emergencies to every waiting patient at once.' },
  { icon: BarChart3, title: 'Useful analytics', text: 'Understand token volume, completion rates, and consultation flow by hour.' },
  { icon: ShieldCheck, title: 'Privacy-first public view', text: 'Patients only see token numbers — never names, phones, or medical details.' },
  { icon: Users, title: 'Role-based staff access', text: 'Admins and receptionists get the right tools with server-enforced permissions.' },
]

function QueuePreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/50 via-sky-100/40 to-transparent blur-2xl" />
      <div className="card relative mx-auto w-full max-w-sm overflow-hidden p-0">
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 px-6 pb-14 pt-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">queueless</span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> LIVE
            </span>
          </div>
          <p className="mt-8 text-sm text-white/70">City Care Clinic</p>
          <h3 className="mt-1 text-xl font-bold">Dr. Ananya Mehta</h3>
        </div>
        <div className="-mt-8 space-y-3 px-5 pb-6">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Currently serving</p>
                <p className="mt-1 text-2xl font-extrabold text-brand-600">#024</p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <p className="text-[11px] font-medium text-slate-500">Your token</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">#028</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-[11px] font-semibold text-amber-700">People ahead</p>
              <p className="mt-1 text-xl font-bold text-amber-900">3</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold text-slate-600">Estimated wait</p>
              <p className="mt-1 text-base font-bold text-slate-900">20–30 min</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={15} /> Your status: Waiting
          </div>
        </div>
      </div>
      <div className="card absolute -left-4 bottom-8 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg sm:-left-10">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={13} />
        </span>
        Updated just now
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <Sparkles size={13} /> Live clinic & OPD token tracker
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
              Your Turn.
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
                Without the Wait.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Track your clinic queue in real time. Scan a QR code, check your position, and spend
              less time waiting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg">
                  Register Your Clinic <ArrowRight size={16} />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" size="lg">
                  Explore How It Works
                </Button>
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2"><Smartphone size={15} className="text-brand-500" /> No app required</span>
              <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-brand-500" /> No patient data exposed</span>
              <span className="flex items-center gap-2"><Clock3 size={15} className="text-brand-500" /> Sets up in minutes</span>
            </div>
          </div>
          <QueuePreview />
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/60 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ['10,000+', 'Fewer crowded waiting rooms'],
            ['Real time', 'Every token update is instant'],
            ['100%', 'Token-only public information'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Three steps to a calmer waiting room
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Simple for patients. Powerful for the team behind the counter.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="card relative p-6">
                <span className="absolute right-5 top-5 text-4xl font-black text-slate-100">0{index + 1}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <step.icon size={20} />
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="scroll-mt-20 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Building2 size={20} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">For clinics</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Run the queue, not the crowd.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Issue tokens, call the next patient, handle breaks and emergencies, and keep every
                receptionist on the same page — with a full audit trail.
              </p>
              <ul className="mt-6 space-y-3">
                {['One QR code per clinic, ready to print', 'Concurrent-safe token updates', 'Announcements reach every patient instantly'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Today&apos;s queue</p>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Open</span>
              </div>
              <div className="mt-5 space-y-2">
                {[
                  ['#024', 'In consultation', 'bg-brand-50 text-brand-700'],
                  ['#025', 'Waiting', 'bg-amber-50 text-amber-700'],
                  ['#026', 'Waiting', 'bg-amber-50 text-amber-700'],
                  ['#027', 'Waiting', 'bg-amber-50 text-amber-700'],
                ].map(([token, status, tone]) => (
                  <div key={token} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <span className="text-sm font-bold text-slate-800">{token}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="card order-2 p-6 lg:order-1">
              <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
                  <HeartPulse size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Your turn is approaching!</p>
                  <p className="text-xs text-slate-600">Please return to the clinic reception.</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs text-slate-500">People ahead</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">2</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs text-slate-500">Estimated wait</p>
                  <p className="mt-1 text-base font-bold text-slate-900">12–18 min</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <HeartPulse size={20} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">For patients</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Wait anywhere but the waiting room.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                No account. No app. Just a token number and a live page that tells you exactly when
                to come back. Your name and details are never shown publicly.
              </p>
              <ul className="mt-6 space-y-3">
                {['Works on any phone with a camera', 'Knows when you are two tokens away', 'Clear messages when the doctor is delayed'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything a modern clinic queue needs
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6 transition-transform hover:-translate-y-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <feature.icon size={18} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to clear your waiting room?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Create your clinic in minutes. Print one QR code. Give every patient their time back.
            </p>
          </div>
          <Link to="/register" className="shrink-0">
            <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-brand-50">
              Register Your Clinic <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
