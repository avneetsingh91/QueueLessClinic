import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from './Logo'
import Button from '../common/Button'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Benefits', href: '/#benefits' },
    { label: 'Features', href: '/#features' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <NavLink to="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-600">
            Staff login
          </NavLink>
          <Link to="/register">
            <Button size="sm">
              Register your clinic <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Staff login
            </Link>
            <Link to="/register" onClick={() => setOpen(false)} className="mt-2">
              <Button className="w-full">Register your clinic</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
