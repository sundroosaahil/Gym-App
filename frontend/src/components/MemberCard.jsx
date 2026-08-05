import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';

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
    amountPaid: member.amountPaid
  });
  const [editError, setEditError] = useState(null);

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
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-xs text-[#999] font-mono">{member.gymCode}</p>
          </div>
          <StatusBadge status={member.status} />
        </div>

        <p className="text-sm text-[#999] mb-1">{member.residence || '—'}</p>
        <p className="text-sm text-[#999] mb-3">Days past: {member.daysPastExpiry}</p>

        {expanded && (
          <div className="text-sm text-[#999] space-y-1 mb-3 pb-3 border-b border-[#2A2A2A]">
            <p>Start Date: {new Date(member.startDate).toLocaleDateString()}</p>
            <p>End Date: {new Date(member.endDate).toLocaleDateString()}</p>
            <p>Amount Paid: ₹{member.amountPaid}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowMarkPaid(!showMarkPaid)}
          className="bg-[#F2C230] text-black text-xs font-bold uppercase px-3 py-1.5 rounded hover:bg-[#C6FF3D] transition-colors"
        >
          Mark Paid
        </button>
        {member.renewalIntent === 'not_renewing' ? (
          <button
            onClick={handleReactivate}
            className="bg-[#2A2A2A] text-[#F5F5F0] text-xs font-bold uppercase px-3 py-1.5 rounded hover:bg-[#333] transition-colors"
          >
            Reactivate
          </button>
        ) : (
          <button
            onClick={handleNotRenewing}
            className="bg-transparent border border-red-500/40 text-red-400 text-xs font-bold uppercase px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors"
          >
            Not Renewing
          </button>
        )}
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="bg-[#2A2A2A] text-[#F5F5F0] p-1.5 rounded hover:bg-[#333] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-transparent border border-red-500/40 text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
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