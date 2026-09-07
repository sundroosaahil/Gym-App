import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

function Modal({ children, onClose }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Without this, the page behind the modal keeps scrolling on touch
  // devices — the modal looks "open" but the body content underneath
  // drifts, which reads as a bug even though nothing is technically broken.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm modal-backdrop-fade-in text-[#F5F5F0]"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#999] hover:text-white hover:border-[#F2C230] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="max-h-[85vh] overflow-y-auto overflow-x-hidden no-scrollbar rounded-lg member-card-pop-in">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;