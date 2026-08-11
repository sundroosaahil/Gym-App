import { useState } from 'react';
import { Pencil, Trash2, MessageCircle, Loader2, Check } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import { formatDate } from '../utils/formatDate';
import { buildWhatsAppReminderLink } from '../utils/sendWhatsAppReminder';
import { toFullPhone, toLocalPhone } from '../utils/formatPhone';

function MemberRow({ member, onUpdated }) {
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [durationChoice, setDurationChoice] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [markPaidReceiptNo, setMarkPaidReceiptNo] = useState('');
  const [mode, setMode] = useState('renewal');
  const [markPaidStatus, setMarkPaidStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [error, setError] = useState(null);

  const latestReceiptNo =
    member.receipts && member.receipts.length > 0
      ? member.receipts[member.receipts.length - 1].receiptNo
      : null;

  const [editData, setEditData] = useState({
    name: member.name,
    residence: member.residence || '',
    phone: toLocalPhone(member.phone),
    amountPaid: member.amountPaid,
    receiptNo: latestReceiptNo || ''
  });
  const [editError, setEditError] = useState(null);

  const showReminderButton =
    (member.status === 'pending' || member.status === 'inactive') && member.phone;

  async function handleMarkPaid(e) {
    e.preventDefault();
    if (markPaidStatus !== 'idle') return; // guard against double-submit
    setError(null);
    setMarkPaidStatus('submitting');
    const durationDays =
      durationChoice === 'custom' ? Number(customDays) : Number(durationChoice);
    try {
      await api.put(`/members/${member._id}/mark-paid`, {
        durationDays,
        amountPaid: Number(amountPaid),
        mode,
        ...(markPaidReceiptNo.trim() && { receiptNo: markPaidReceiptNo.trim() })
      });
      setMarkPaidStatus('success');
      setTimeout(() => {
        setShowMarkPaid(false);
        setAmountPaid('');
        setCustomDays('');
        setMarkPaidReceiptNo('');
        setMarkPaidStatus('idle');
        onUpdated();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark paid');
      setMarkPaidStatus('idle');
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
        amountPaid: Number(editData.amountPaid),
        ...(editData.receiptNo.trim() && { receiptNo: editData.receiptNo.trim() })
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
    'bg-[#111] border border-[#333] rounded px-3 py-2 text-sm w-full';

  return (
    <>
      <tr className={`border-t border-[#2A2A2A] hover:bg-[#222] transition-colors ${
        member.status === 'pending' ? 'bg-orange-500/5' : ''
      }`}>
        <td className="px-4 py-3 font-mono text-[#999]">{member.gymCode}</td>
        <td className="px-4 py-3 font-semibold">{member.name}</td>
        <td className="px-4 py-3 text-[#999]">{member.residence || '—'}</td>
        <td className="px-4 py-3"><StatusBadge status={member.status} /></td>
        <td className="px-4 py-3 text-[#999]">{formatDate(member.startDate)}</td>
        <td className="px-4 py-3 text-[#999]">{formatDate(member.endDate)}</td>
        <td className="px-4 py-3 text-[#999]">{member.daysPastExpiry}</td>
        <td className="px-4 py-3 text-[#999]">
          ₹{member.amountPaid}
          <div className="text-xs text-[#666]">Rcpt: {latestReceiptNo || '—'}</div>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {showReminderButton && (
              <a
                href={buildWhatsAppReminderLink(member)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white p-1.5 rounded hover:bg-[#20BD5A] transition-colors"
                title="Send WhatsApp Reminder"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
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
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-transparent border border-red-500/40 text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {showMarkPaid && (
        <tr className="bg-[#111]">
          <td colSpan="9" className="px-4 py-4">
            <form onSubmit={handleMarkPaid} className="flex flex-wrap items-end gap-3">
              {error && <p className="text-red-400 text-sm w-full">{error}</p>}
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Start Date</label>
                <div className="flex gap-1 bg-[#1A1A1A] border border-[#333] rounded p-1">
                  <button
                    type="button"
                    onClick={() => setMode('renewal')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      mode === 'renewal' ? 'bg-[#F2C230] text-black font-bold' : 'text-[#999] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Due Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      mode === 'reset' ? 'bg-[#F2C230] text-black font-bold' : 'text-[#999] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Today
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Duration</label>
                <select
                  value={durationChoice}
                  onChange={(e) => setDurationChoice(e.target.value)}
                  className="bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm"
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
                    className="bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm w-24"
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
                  className="bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm w-28"
                />
              </div>
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Receipt No.</label>
                <input
                  type="text"
                  value={markPaidReceiptNo}
                  onChange={(e) => setMarkPaidReceiptNo(e.target.value)}
                  placeholder="optional"
                  className="bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm w-28"
                />
              </div>
              <button
                type="submit"
                disabled={markPaidStatus !== 'idle'}
                className={`text-sm font-bold uppercase px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 min-w-[110px] ${
                  markPaidStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-[#C6FF3D] text-black hover:bg-[#F2C230]'
                } ${markPaidStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {markPaidStatus === 'submitting' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                )}
                {markPaidStatus === 'success' && (
                  <>
                    <Check className="w-4 h-4" />
                    Done!
                  </>
                )}
                {markPaidStatus === 'idle' && 'Confirm'}
              </button>
            </form>
          </td>
        </tr>
      )}

      {showEdit && (
        <tr className="bg-[#111]">
          <td colSpan="9" className="px-4 py-4">
            <form onSubmit={handleEditSubmit} className="flex flex-wrap items-end gap-3">
              {editError && <p className="text-red-400 text-sm w-full">{editError}</p>}
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
                    className="bg-[#111] border border-[#333] rounded-r px-3 py-2 text-sm w-full"
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
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Receipt No.</label>
                <input
                  value={editData.receiptNo}
                  onChange={(e) => setEditData({ ...editData, receiptNo: e.target.value })}
                  placeholder="optional"
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
          </td>
        </tr>
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
    </>
  );
}

export default MemberRow;