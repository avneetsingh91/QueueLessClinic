import { useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Eye, Printer, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { publicQueueUrl } from '../../services/firebase'

export default function QRCodeCard({ slug, clinicName, compact = false }) {
  const containerRef = useRef(null)
  const [viewOpen, setViewOpen] = useState(false)
  const url = slug ? publicQueueUrl(slug) : ''

  if (!slug) {
    return (
      <div className="card p-5 text-sm text-slate-500">
        Your public queue link will appear here once your clinic is set up.
      </div>
    )
  }

  const getCanvas = () => containerRef.current?.querySelector('canvas') || null

  const download = () => {
    const canvas = getCanvas()
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `queueless-${slug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR code downloaded.')
  }

  const print = () => {
    const canvas = getCanvas()
    if (!canvas) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Allow pop-ups to print the QR code.')
      return
    }
    printWindow.document.write(`
      <html><head><title>Queueless — ${clinicName || 'Clinic'}</title>
      <style>
        body { font-family: Inter, Arial, sans-serif; text-align: center; padding: 48px; }
        h1 { font-size: 28px; margin: 0 0 8px; }
        p { color: #64748b; font-size: 15px; margin: 0 0 28px; }
        img { width: 320px; height: 320px; }
        small { display: block; margin-top: 24px; color: #94a3b8; }
      </style></head><body>
      <h1>${clinicName || 'Clinic'}</h1>
      <p>Scan to see the live queue on your phone</p>
      <img src="${canvas.toDataURL('image/png')}" alt="Queue QR code" />
      <small>queueless · No app or account needed</small>
      </body></html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 300)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Public queue link copied.')
    } catch {
      toast.error('Unable to copy. Select the link manually.')
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <QrCode size={17} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Patient QR code</h2>
          <p className="text-xs text-slate-500">Print and place at reception.</p>
        </div>
      </div>
      <div className="flex flex-col items-center px-5 py-5">
        <div ref={containerRef} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
          <QRCodeCanvas value={url} size={compact ? 128 : 168} level="M" includeMargin />
        </div>
        <button
          type="button"
          onClick={copy}
          className="mt-4 w-full truncate rounded-lg bg-slate-50 px-3 py-2 text-center text-[11px] font-medium text-slate-500 hover:bg-slate-100"
          title={url}
        >
          {url}
        </button>
        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={download}>
            <Download size={14} /> PNG
          </Button>
          <Button variant="secondary" size="sm" onClick={print}>
            <Printer size={14} /> Print
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setViewOpen(true)}>
            <Eye size={14} /> View
          </Button>
          <Button variant="secondary" size="sm" onClick={copy}>
            <Copy size={14} /> Copy link
          </Button>
        </div>
      </div>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Public queue QR code" size="sm">
        <div className="flex flex-col items-center py-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <QRCodeSVG value={url} size={240} level="M" includeMargin />
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">{url}</p>
        </div>
      </Modal>
    </div>
  )
}
