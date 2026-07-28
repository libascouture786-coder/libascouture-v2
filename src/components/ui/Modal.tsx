import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
};

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  md: 'modal-panel',
  lg: 'modal-panel-lg',
  xl: 'modal-panel-xl',
};

export function Modal({ open, onClose, children, size = 'md', closeOnOverlay = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={sizeClasses[size]}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="modal-close">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
