import { Dialog, DialogTitle, ModalBody } from './ui/dialog'

export default function Modal({ open, title, onClose, children, size = 'md', hideClose = false }) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={hideClose ? undefined : title}
      size={size}
    >
      {hideClose && title && <DialogTitle className="sr-only">{title}</DialogTitle>}
      <ModalBody>{children}</ModalBody>
    </Dialog>
  )
}
