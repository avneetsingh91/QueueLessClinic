const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-ring disabled:bg-brand-300',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 focus-ring disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-ring',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-ring disabled:bg-rose-300',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-ring',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 focus-ring',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 disabled:opacity-70 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
