import { useState } from 'react';
import { Pencil, Trash2, MessageCircle, Loader2, Check, UserX } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import { useInView } from '../hooks/useInView';
import { formatDate } from '../utils/formatDate';
import { buildWhatsAppReminderLink } from '../utils/sendWhatsAppReminder';
import { toFullPhone, toLocalPhone } from '../utils/formatPhone';

function MemberCard({ member, onUpdated }) {
  const [ref, inView] = useInView();
  const [expanded, setExpanded] = useState(false);
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [durationChoice, setDurationChoice] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [markPaidReceiptNo, setMarkPaidReceiptNo] = useState('');
  const [mode, setMode] = useState('renewal');
  const [markPaidStatus, setMarkPaidStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [notRenewingStatus, setNotRenewingStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
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
  const [remindMessage, setRemindMessage] = useState(null);

  const hasPhone = Boolean(member.phone);

  function handleRemindClick() {
    if (member.status === 'active') {
      showRemindMessage('This member is active no reminder needed.');
      return;
    }
    if (!hasPhone) {
      showRemindMessage('No phone number added for this member.');
      return;
    }
    window.open(buildWhatsAppReminderLink(member), '_blank', 'noopener,noreferrer');
  }

  function showRemindMessage(msg) {
    setRemindMessage(msg);
    setTimeout(() => setRemindMessage(null), 2500);
  }

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
    if (notRenewingStatus !== 'idle') return; // guard against double-submit
    setNotRenewingStatus('submitting');
    try {
      await api.put(`/members/${member._id}/not-renewing`);
      setNotRenewingStatus('success');
      setTimeout(() => {
        setNotRenewingStatus('idle');
        onUpdated();
      }, 700);
    } catch (err) {
      setNotRenewingStatus('idle');
    }
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
    'bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-sm w-full';

  return (
    <div
      ref={ref}
      className={`bg-[#1A1A1A] border rounded-lg p-4 ${inView ? 'member-card-pop-in' : ''} ${
        member.status === 'pending' ? 'border-orange-500/50' : 'border-[#2A2A2A]'
      }`}
    >
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
            <p>Receipt No: {latestReceiptNo || '—'}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {member.renewalIntent === 'not_renewing' ? (
              <button
                onClick={handleReactivate}
                className="col-span-2 bg-[#2A2A2A] text-[#F5F5F0] text-sm font-bold uppercase py-3 rounded hover:bg-[#333] active:scale-95 transition-all"
              >
                Reactivate
              </button>
            ) : (
              <>
                <button
                  onClick={handleRemindClick}
                  className={`col-span-2 flex items-center justify-center gap-2 text-sm font-bold uppercase py-3 rounded border transition-colors ${
                    member.status === 'active'
                      ? 'border-[#333] text-[#555] hover:bg-[#2A2A2A]/50'
                      : !hasPhone
                      ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                      : 'border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Remind
                </button>
                <button
                  onClick={() => setShowMarkPaid(!showMarkPaid)}
                  className="bg-[#F2C230] text-black text-sm font-bold uppercase py-3 rounded hover:bg-[#C6FF3D] transition-colors"
                >
                  Mark Paid
                </button>
                <button
                  onClick={handleNotRenewing}
                  disabled={notRenewingStatus !== 'idle'}
                  className={`text-sm font-bold uppercase py-3 rounded flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    notRenewingStatus === 'success'
                      ? 'bg-gray-500/30 border border-gray-400 text-gray-200'
                      : 'bg-transparent border border-gray-500/40 text-gray-400 hover:bg-gray-500/10'
                  } ${notRenewingStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {notRenewingStatus === 'submitting' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Marking...
                    </>
                  )}
                  {notRenewingStatus === 'success' && (
                    <>
                      <Check className="w-4 h-4" />
                      Done
                    </>
                  )}
                  {notRenewingStatus === 'idle' && (
                    <>
                      <UserX className="w-4 h-4" />
                      Not Renewing
                    </>
                  )}
                </button>
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
              </>
            )}
          </div>

          {remindMessage && (
            <p className="text-xs text-[#999] mb-2">{remindMessage}</p>
          )}

          {showMarkPaid && (
            <form onSubmit={handleMarkPaid} className="mt-3 pt-3 border-t border-[#2A2A2A] flex flex-wrap items-end gap-3">
              {error && <p className="text-red-400 text-sm w-full">{error}</p>}
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Start Date</label>
                <div className="flex gap-1 bg-[#111] border border-[#333] rounded p-1">
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
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Receipt No.</label>
                <input
                  type="text"
                  value={markPaidReceiptNo}
                  onChange={(e) => setMarkPaidReceiptNo(e.target.value)}
                  placeholder="optional"
                  className="bg-[#111] border border-[#333] rounded px-3 py-2 text-sm w-28"
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