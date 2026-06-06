import { AlertTriangle } from 'lucide-react'
import { ModalPortal } from './ModalPortal'
import { Button } from './ui/Button'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/50 p-4 sm:p-6">
      <div className="w-full max-w-md animate-rise border border-ink-900/15 bg-bone-50 shadow-lift">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            {variant === 'danger' && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-rust-500/10 text-rust-500">
                <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
              </div>
            )}
            <div>
              <h3 className="font-display text-xl text-ink-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-900/65">{message}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-ink-900/10">
          <Button type="button" variant="ghost" disabled={loading} onClick={onCancel} className="h-12">
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            disabled={loading}
            onClick={onConfirm}
            className="h-12 border-y-0 border-r-0"
          >
            {loading ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
      </div>
    </ModalPortal>
  )
}
