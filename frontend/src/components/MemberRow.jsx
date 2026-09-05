import { useState, useEffect, useRef, memo } from 'react';
import { Pencil, Trash2, MessageCircle, Loader2, Check, IndianRupee, UserX } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import { formatDate } from '../utils/formatDate';
import { buildWhatsAppReminderLink } from '../utils/sendWhatsAppReminder';
import { toFullPhone, toLocalPhone } from '../utils/formatPhone';

function MemberRow({ member, isOpen, onToggle, onEditingChange, onMarkPaidChange, shakeSignal, onUpdated }) {
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
  const [isShaking, setIsShaking] = useState(false);
  const prevShakeSignal = useRef(shakeSignal);

  useEffect(() => {
    if (!isOpen) {
      setShowMarkPaid(false);
      setShowEdit(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (shakeSignal !== prevShakeSignal.current) {
      prevShakeSignal.current = shakeSignal;
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [shakeSignal]);

  function handleToggleEdit() {
    const next = !showEdit;
    setShowEdit(next);
    onEditingChange(member._id, member.name, next);
  }

  function handleToggleMarkPaid() {
    const next = !showMarkPaid;
    setShowMarkPaid(next);
    onMarkPaidChange(member._id, member.name, next);
  }

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
        onMarkPaidChange(member._id, member.name, false);
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
      onEditingChange(member._id, member.name, false);
      onUpdated();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update member');
    }
  }

  async function handleDelete() {
    await api.delete(`/members/${member._id}`);
    setShowDeleteConfirm(false);
    // If this member happened to have an edit or mark-paid form open, clear
    // the parent's lock — otherwise deleting mid-edit/payment would leave
    // every other member permanently blocked with nothing left to cancel it.
    onEditingChange(member._id, member.name, false);
    onMarkPaidChange(member._id, member.name, false);
    onUpdated();
  }

  const editInputClass =
    'bg-[#111] border border-[#333] rounded px-3 py-2 text-sm w-full';

  return (
    <tbody>
      <tr
        onClick={() => onToggle(member._id, member.name)}
        className={`cursor-pointer ${isShaking ? 'member-card-shake' : ''} ${member.status === 'pending' ? 'bg-orange-500/5' : ''}`}
      >
        <td className="border border-[#2A2A2A] px-4 py-3 font-mono text-[#999]">{member.gymCode}</td>
        <td className="border border-[#2A2A2A] px-4 py-3 font-semibold">{member.name}</td>
        <td className="border border-[#2A2A2A] px-4 py-3 text-[#999]">{member.residence || '—'}</td>
        <td className="border border-[#2A2A2A] px-4 py-3"><StatusBadge status={member.status} /></td>
        <td className="border border-[#2A2A2A] px-4 py-3 text-[#999]">{formatDate(member.startDate)}</td>
        <td className="border border-[#2A2A2A] px-4 py-3 text-[#999]">{formatDate(member.endDate)}</td>
        <td className="border border-[#2A2A2A] px-4 py-3 text-[#999]">{member.daysPastExpiry}</td>
        <td className="border border-[#2A2A2A] px-4 py-3 text-[#999]">
          ₹{member.amountPaid}
          <div className="text-xs text-[#666]">Rcpt: {latestReceiptNo || '—'}</div>
        </td>
        <td className="border border-[#2A2A2A] px-3 py-2 text-center text-xs uppercase tracking-wide text-[#666]">
          {isOpen ? 'Actions below' : 'Click to take action'}
        </td>
      </tr>

      <tr className={isOpen ? '' : 'hidden'}>
        <td colSpan="9" className="border border-t-0 border-[#2A2A2A] border-b-2 border-b-[#333] px-4 py-3">
          <div className="flex items-stretch gap-2">
            {member.renewalIntent === 'not_renewing' ? (
              <button
                onClick={handleReactivate}
                className="flex-1 bg-[#2A2A2A] text-[#F5F5F0] text-sm font-bold uppercase py-2.5 rounded hover:bg-[#333] active:scale-95 transition-all"
              >
                Reactivate
              </button>
            ) : (
              <>
                <button
                  onClick={handleRemindClick}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border text-sm font-bold uppercase transition-colors ${
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
                  onClick={handleToggleMarkPaid}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border border-[#F2C230]/40 text-[#F2C230] text-sm font-bold uppercase hover:bg-[#F2C230]/10 transition-colors ${
                    isShaking && showMarkPaid ? 'markpaid-btn-glow' : ''
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  {showMarkPaid ? 'Cancel' : 'Mark Paid'}
                </button>
                <button
                  onClick={handleNotRenewing}
                  disabled={notRenewingStatus !== 'idle'}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border text-sm font-bold uppercase transition-all active:scale-95 ${
                    notRenewingStatus === 'success'
                      ? 'border-gray-400 bg-gray-500/30 text-gray-200'
                      : 'border-gray-500/40 text-gray-400 hover:bg-gray-500/10'
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
                  onClick={handleToggleEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border border-[#333] text-[#999] text-sm font-bold uppercase hover:bg-[#2A2A2A] hover:text-[#F5F5F0] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border border-red-500/40 text-red-400 text-sm font-bold uppercase hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
          {remindMessage && (
            <p className="text-xs text-[#999] mt-2">{remindMessage}</p>
          )}
        </td>
      </tr>

      <tr>
        <td colSpan="9" className="h-2 bg-[#0D0D0D] p-0 border-0"></td>
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
                } ${markPaidStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''} ${
                  isShaking ? 'markpaid-btn-glow' : ''
                }`}
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
    </tbody>
  );
}

export default memo(MemberRow);