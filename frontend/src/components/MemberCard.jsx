import { useState } from 'react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import StatusBadge from './StatusBadge';

function MemberCard({ member, onUpdated }) {
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [durationChoice, setDurationChoice] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState(null);

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

  return (
       <div
          className={`bg-[#1A1A1A] border rounded-lg p-4 ${
            member.status === 'pending'
              ? 'border-orange-500/50'
              : 'border-[#2A2A2A]'
          }`}
        >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">{member.name}</p>
          <p className="text-xs text-[#999] font-mono">{member.gymCode}</p>
        </div>
        <StatusBadge status={member.status} />
      </div>

      <p className="text-sm text-[#999] mb-1">{member.phone}</p>
      <p className="text-sm text-[#999] mb-3">Days past: {member.daysPastExpiry}</p>

      <div className="flex flex-wrap gap-2">
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
    </div>
  );
}

export default MemberCard;