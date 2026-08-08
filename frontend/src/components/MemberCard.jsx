import { useState } from 'react';
import { Pencil, Trash2, MessageCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import { formatDate } from '../utils/formatDate';
import { buildWhatsAppReminderLink } from '../utils/sendWhatsAppReminder';
import { toFullPhone, toLocalPhone } from '../utils/formatPhone';

function MemberCard({ member, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [durationChoice, setDurationChoice] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState(null);

  const [editData, setEditData] = useState({
    name: member.name,
    residence: member.residence || '',
    phone: toLocalPhone(member.phone),
    amountPaid: member.amountPaid
  });
  const [editError, setEditError] = useState(null);

  const showReminderButton =
    (member.status === 'pending' || member.status === 'inactive') && member.phone;

  async function handleMarkPaid(e) {
    e.preventDefault();
    setError(null);
    const durationDays =
      durationChoice === 'custom' ? Number(customDays) : Number(durationChoice);
    try {
      await api.put(`/members/${member._id}/mark-paid`, {
        durationDays,
        amountPaid: Number(amountPaid)
      });
      setShowMarkPaid(false);
      setAmountPaid('');
      setCustomDays('');
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark paid');
    }
  }

  async function handleNotRenewing() {
    await api.put(`/members/${member._id}/not-renewing`);
    onUpdated();
  }

  async function handleReactivate() {
    await api.put(`/members/${member._id}/reactivate`);
    onUpdated();
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditError(null);
    try {
      await api.put(`/members/${member._id}`, {
        name: editData.name,
        residence: editData.residence,
        phone: toFullPhone(editData.phone),
        amountPaid: Number(editData.amountPaid)
      });
      setShowEdit(false);
      onUpdated();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update member');
    }
  }

  async function handleDelete() {
    await api.delete(`/members/${member._id}`);
    setShowDeleteConfirm(false);
    onUpdated();
  }

  const editInputClass =
    'bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-sm w-full';

  return (
    <div className={`bg-[#1A1A1A] border rounded-lg p-4 ${
      member.status === 'pending' ? 'border-orange-500/50' : 'border-[#2A2A2A]'
    }`}>
      {/* Collapsed view — always visible, tap to expand */}
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-xs text-[#999] font-mono">{member.gymCode}</p>
          </div>
          <StatusBadge status={member.status} />
        </div>

        <p className="text-sm text-[#999] mb-1">{member.residence || '—'}</p>
        <p className="text-sm text-[#999]">Days past: {member.daysPastExpiry}</p>
      </div>

      {/* Expanded view — extra details + actions, only rendered when opened */}
      {expanded && (
        <div onClick={(e) => e.stopPropagation()}>
          <div className="text-sm text-[#999] space-y-1 mt-3 mb-4 pt-3 border-t border-[#2A2A2A]">
            <p>Start Date: {formatDate(member.startDate)}</p>
            <p>End Date: {formatDate(member.endDate)}</p>
            <p>Amount Paid: ₹{member.amountPaid}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {showReminderButton && (
              <a
                href={buildWhatsAppReminderLink(member)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white flex items-center justify-center gap-2 text-sm font-bold uppercase py-3 rounded hover:bg-[#20BD5A] transition-colors col-span-2"
              >
                <MessageCircle className="w-4 h-4" />
                Send Reminder
              </a>
            )}
            <button
              onClick={() => setShowMarkPaid(!showMarkPaid)}
              className="bg-[#F2C230] text-black text-sm font-bold uppercase py-3 rounded hover:bg-[#C6FF3D] transition-colors"
            >
              Mark Paid
            </button>
            {member.renewalIntent === 'not_renewing' ? (
              <button
                onClick={handleReactivate}
                className="bg-[#2A2A2A] text-[#F5F5F0] text-sm font-bold uppercase py-3 rounded hover:bg-[#333] transition-colors"
              >
                Reactivate
              </button>
            ) : (
              <button
                onClick={handleNotRenewing}
                className="bg-transparent border border-red-500/40 text-red-400 text-sm font-bold uppercase py-3 rounded hover:bg-red-500/10 transition-colors"
              >
                Not Renewing
              </button>
            )}
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="bg-[#2A2A2A] text-[#F5F5F0] flex items-center justify-center gap-2 text-sm font-bold uppercase py-3 rounded hover:bg-[#333] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-transparent border border-red-500/40 text-red-400 flex items-center justify-center gap-2 text-sm font-bold uppercase py-3 rounded hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          {showMarkPaid && (
            <form onSubmit={handleMarkPaid} className="mt-3 pt-3 border-t border-[#2A2A2A] flex flex-wrap items-end gap-3">
              {error && <p className="text-red-400 text-sm w-full">{error}</p>}
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Duration</label>
                <select
                  value={durationChoice}
                  onChange={(e) => setDurationChoice(e.target.value)}
                  className="bg-[#111] border border-[#333] rounded px-3 py-2 text-sm"
                >
                  {durationOptions.map((opt) => (
                    <option key={opt.label} value={opt.days}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {durationChoice === 'custom' && (
                <div>
                  <label className="block text-xs text-[#999] uppercase mb-1">Days</label>
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    required
                    className="bg-[#111] border border-[#333] rounded px-3 py-2 text-sm w-20"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Amount</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                  className="bg-[#111] border border-[#333] rounded px-3 py-2 text-sm w-24"
                />
              </div>
              <button
                type="submit"
                className="bg-[#C6FF3D] text-black text-sm font-bold uppercase px-4 py-2 rounded hover:bg-[#F2C230] transition-colors"
              >
                Confirm
              </button>
            </form>
          )}

          {showEdit && (
            <form onSubmit={handleEditSubmit} className="mt-3 pt-3 border-t border-[#2A2A2A] flex flex-col gap-3">
              {editError && <p className="text-red-400 text-sm">{editError}</p>}
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Name</label>
                <input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                  className={editInputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Residence</label>
                <input
                  value={editData.residence}
                  onChange={(e) => setEditData({ ...editData, residence: e.target.value })}
                  className={editInputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Phone</label>
                <div className="flex">
                  <span className="flex items-center bg-[#0D0D0D] border border-r-0 border-[#333] rounded-l px-3 text-sm text-[#999]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    placeholder="9876543210"
                    className="bg-[#0D0D0D] border border-[#333] rounded-r px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Amount Paid</label>
                <input
                  type="number"
                  value={editData.amountPaid}
                  onChange={(e) => setEditData({ ...editData, amountPaid: e.target.value })}
                  required
                  className={editInputClass}
                />
              </div>
              <button
                type="submit"
                className="bg-[#F2C230] text-black text-sm font-bold uppercase py-2 rounded hover:bg-[#C6FF3D] transition-colors"
              >
                Save
              </button>
            </form>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Member?"
          message={`This will permanently delete ${member.name} (${member.gymCode}). This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

export default MemberCard;