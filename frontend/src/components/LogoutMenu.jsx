import { useState, useRef, useEffect } from 'react';
import { MoreVertical, LogOut, Loader2, ShieldOff } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

function LogoutMenu({ onLogout, onLogoutAll, isLoggingOut }) {
  const [open, setOpen] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isLoggingOut}
        className="flex items-center justify-center w-8 h-8 rounded text-[#999] hover:text-[#F2C230] hover:bg-[#1A1A1A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Account menu"
      >
        {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl overflow-hidden z-40">
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#F5F5F0] hover:bg-[#2A2A2A] transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-[#999]" />
            Log Out
          </button>
          <button
            onClick={() => { setOpen(false); setConfirmingAll(true); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#F5F5F0] hover:bg-[#2A2A2A] transition-colors text-left border-t border-[#2A2A2A]"
          >
            <ShieldOff className="w-4 h-4 text-[#999]" />
            Log Out of All Devices
          </button>
        </div>
      )}

      {confirmingAll && (
        <ConfirmDialog
          title="Log Out Everywhere?"
          message="This signs out every device currently logged into this admin account, including this one. Useful if a phone was lost or a session feels compromised."
          confirmLabel="Log Out All"
          danger
          onConfirm={() => { setConfirmingAll(false); onLogoutAll(); }}
          onCancel={() => setConfirmingAll(false)}
        />
      )}
    </div>
  );
}

export default LogoutMenu;