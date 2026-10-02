import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

function Modal({ children, onClose, wide = false }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useBodyScrollLock();

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm modal-backdrop-fade-in text-[#F5F5F0]"
      onClick={onClose}
    >
      <div className={`relative w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'}`} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#999] hover:text-white hover:border-[#F2C230] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto overflow-x-hidden no-scrollbar rounded-lg member-card-pop-in md:max-h-[88dvh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;