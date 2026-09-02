import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

const OPTIONS = [
  { key: 'memberPaid', label: 'Member Paid', description: 'When a member is marked as paid' },
  { key: 'newMember', label: 'New Member Added', description: 'When a new member joins' },
  { key: 'dailyPending', label: 'Daily Pending Reminder', description: 'Morning summary of pending renewals' },
  { key: 'dailyInactive', label: 'Daily Inactive Reminder', description: 'Morning summary of inactive members' }
];

function NotificationSettings({ onClose }) {
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/notification-prefs').then((res) => setPrefs(res.data));
  }, []);

  async function toggle(key) {
    const previous = prefs;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await api.put('/auth/notification-prefs', updated);
    } catch {
      setPrefs(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#F5F5F0] font-semibold">Notifications</h2>
          <button onClick={onClose} className="text-[#999] hover:text-[#F5F5F0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!prefs ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-[#999]" />
          </div>
        ) : (
          <div className="space-y-4">
            {OPTIONS.map((opt) => (
              <div key={opt.key} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[#F5F5F0]">{opt.label}</p>
                  <p className="text-xs text-[#999]">{opt.description}</p>
                </div>
                <button
                  onClick={() => toggle(opt.key)}
                  disabled={saving}
                  className={`shrink-0 w-10 h-6 rounded-full transition-colors relative ${
                    prefs[opt.key] ? 'bg-[#F2C230]' : 'bg-[#333]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      prefs[opt.key] ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationSettings;