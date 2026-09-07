import { useState, useRef, memo } from 'react';
import { Pencil, Trash2, MessageCircle, Loader2, Check, UserX, MapPin, IndianRupee, Banknote, QrCode } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import { useInView } from '../hooks/useInView';
import { formatDate } from '../utils/formatDate';
import { buildWhatsAppReminderLink } from '../utils/sendWhatsAppReminder';
import { toFullPhone, toLocalPhone } from '../utils/formatPhone';
import { getRenewalLabel } from '../utils/renewalLabel';
import { useToast } from '../context/ToastContext';

const MARK_PAID_DEFAULTS = {
  durationChoice: '30',
  customDays: '',
  amountPaid: '',
  markPaidReceiptNo: '',
  mode: 'renewal',
  paymentMode: ''
};

function MemberCard({ member, isOpen, onToggle, onUpdated }) {
  const [ref, inView] = useInView();
  const { showToast } = useToast();
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [durationChoice, setDurationChoice] = useState(MARK_PAID_DEFAULTS.durationChoice);
  const [customDays, setCustomDays] = useState(MARK_PAID_DEFAULTS.customDays);
  const [amountPaid, setAmountPaid] = useState(MARK_PAID_DEFAULTS.amountPaid);
  const [markPaidReceiptNo, setMarkPaidReceiptNo] = useState(MARK_PAID_DEFAULTS.markPaidReceiptNo);
  const [mode, setMode] = useState(MARK_PAID_DEFAULTS.mode);
  const [paymentMode, setPaymentMode] = useState(MARK_PAID_DEFAULTS.paymentMode);
  const [markPaidStatus, setMarkPaidStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [notRenewingStatus, setNotRenewingStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [error, setError] = useState(null);
  // Asks "discard changes?" before actually closing the Mark Paid modal.
  const [confirmDiscardMarkPaid, setConfirmDiscardMarkPaid] = useState(false);

  const latestReceiptNo =
    member.receipts && member.receipts.length > 0
      ? member.receipts[member.receipts.length - 1].receiptNo
      : null;

  const makeEditSnapshot = () => ({
    name: member.name,
    residence: member.residence || '',
    phone: toLocalPhone(member.phone),
    amountPaid: member.amountPaid,
    receiptNo: latestReceiptNo || '',
    paymentMode: member.paymentMode || ''
  });

  const [editData, setEditData] = useState(makeEditSnapshot);
  const [editError, setEditError] = useState(null);
  const [editStatus, setEditStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [remindMessage, setRemindMessage] = useState(null);
  // Asks "discard changes?" before actually closing the Edit modal.
  const [confirmDiscardEdit, setConfirmDiscardEdit] = useState(false);
  // Snapshot taken the moment the Edit modal opens, so we can tell whether
  // anything actually changed before warning about discarding it.
  const initialEditDataRef = useRef(editData);

  const hasPhone = Boolean(member.phone);

  function handleOpenEdit() {
    const snapshot = makeEditSnapshot();
    setEditData(snapshot);
    initialEditDataRef.current = snapshot;
    setEditError(null);
    setEditStatus('idle');
    setShowEdit(true);
  }

  function isEditDirty() {
    return JSON.stringify(editData) !== JSON.stringify(initialEditDataRef.current);
  }

  function handleRequestCloseEdit() {
    if (isEditDirty()) {
      setConfirmDiscardEdit(true);
      return;
    }
    setShowEdit(false);
  }

  function handleConfirmDiscardEdit() {
    setEditData(initialEditDataRef.current);
    setEditError(null);
    setConfirmDiscardEdit(false);
    setShowEdit(false);
  }

  function handleOpenMarkPaid() {
    setDurationChoice(MARK_PAID_DEFAULTS.durationChoice);
    setCustomDays(MARK_PAID_DEFAULTS.customDays);
    setAmountPaid(MARK_PAID_DEFAULTS.amountPaid);
    setMarkPaidReceiptNo(MARK_PAID_DEFAULTS.markPaidReceiptNo);
    setMode(MARK_PAID_DEFAULTS.mode);
    setPaymentMode(MARK_PAID_DEFAULTS.paymentMode);
    setError(null);
    setShowMarkPaid(true);
  }

  function isMarkPaidDirty() {
    return (
      amountPaid !== MARK_PAID_DEFAULTS.amountPaid ||
      customDays !== MARK_PAID_DEFAULTS.customDays ||
      markPaidReceiptNo !== MARK_PAID_DEFAULTS.markPaidReceiptNo ||
      durationChoice !== MARK_PAID_DEFAULTS.durationChoice ||
      mode !== MARK_PAID_DEFAULTS.mode ||
      paymentMode !== MARK_PAID_DEFAULTS.paymentMode
    );
  }

  function handleRequestCloseMarkPaid() {
    if (isMarkPaidDirty()) {
      setConfirmDiscardMarkPaid(true);
      return;
    }
    setShowMarkPaid(false);
  }

  function handleConfirmDiscardMarkPaid() {
    setConfirmDiscardMarkPaid(false);
    setShowMarkPaid(false);
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
        ...(paymentMode && { paymentMode }),
        ...(markPaidReceiptNo.trim() && { receiptNo: markPaidReceiptNo.trim() })
      });
      setMarkPaidStatus('success');
      showToast(`Payment recorded for ${member.name}`);
      setTimeout(() => {
        setShowMarkPaid(false);
        setAmountPaid(MARK_PAID_DEFAULTS.amountPaid);
        setCustomDays(MARK_PAID_DEFAULTS.customDays);
        setMarkPaidReceiptNo(MARK_PAID_DEFAULTS.markPaidReceiptNo);
        setPaymentMode(MARK_PAID_DEFAULTS.paymentMode);
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
    try {
      await api.put(`/members/${member._id}/reactivate`);
      showToast(`${member.name} reactivated`);
      onUpdated();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to reactivate member', 'error');
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (editStatus !== 'idle') return; // guard against double-submit
    setEditError(null);
    setEditStatus('submitting');
    try {
      await api.put(`/members/${member._id}`, {
        name: editData.name,
        residence: editData.residence,
        phone: toFullPhone(editData.phone),
        amountPaid: Number(editData.amountPaid),
        paymentMode: editData.paymentMode,
        ...(editData.receiptNo.trim() && { receiptNo: editData.receiptNo.trim() })
      });
      setEditStatus('success');
      showToast(`${member.name} updated`);
      setTimeout(() => {
        setShowEdit(false);
        setEditStatus('idle');
        onUpdated();
      }, 700);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update member');
      setEditStatus('idle');
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/members/${member._id}`);
      setShowDeleteConfirm(false);
      showToast(`${member.name} deleted`);
      onUpdated();
    } catch (err) {
      setShowDeleteConfirm(false);
      showToast(err.response?.data?.error || 'Failed to delete member', 'error');
    }
  }

  const editInputClass =
    'bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-sm w-full text-[#F5F5F0] focus:outline-none focus:border-[#F2C230]';

  return (
    <div
      ref={ref}
      className={`bg-[#1A1A1A] border rounded-lg p-4 ${inView ? 'member-card-pop-in' : ''} ${
        member.status === 'pending' ? 'border-orange-500/50' : 'border-[#2A2A2A]'
      }`}
    >
      {/* Collapsed view — always visible, tap to expand */}
      <div onClick={() => onToggle(member._id, member.name)} className="cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-xs text-[#999] font-mono">{member.gymCode}</p>
          </div>
          <StatusBadge status={member.status} />
        </div>

        <p className="text-sm text-[#999] mb-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#666]" />
          {member.residence || '—'}
        </p>
        <p className={`text-sm font-bold ${getRenewalLabel(member).colorClass}`}>
          {getRenewalLabel(member).text}
        </p>
      </div>

      {/* Expanded view — extra details + actions, only rendered when opened */}
      {isOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <div className="text-sm text-[#999] space-y-1 mt-3 mb-4 pt-3 border-t border-[#2A2A2A]">
            <p>Start Date: {formatDate(member.startDate)}</p>
            <p>End Date: {formatDate(member.endDate)}</p>
            <p className="flex items-center gap-1.5">
              Amount Paid: ₹{Number(member.amountPaid || 0).toLocaleString('en-IN')}
              {member.paymentMode === 'cash' && (
                <Banknote className="w-3.5 h-3.5 text-[#F2C230]" aria-label="Paid by cash" />
              )}
              {member.paymentMode === 'upi' && (
                <QrCode className="w-3.5 h-3.5 text-[#F2C230]" aria-label="Paid by UPI" />
              )}
            </p>
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
                  onClick={handleOpenMarkPaid}
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
                  onClick={handleOpenEdit}
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
        </div>
      )}

      {showMarkPaid && (
        <Modal onClose={handleRequestCloseMarkPaid}>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-wide mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#F2C230]" strokeWidth={3} />
              Enter Payment for {member.name}
            </h2>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <form onSubmit={handleMarkPaid} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Start Date</label>
                <div className="flex gap-1 bg-[#111] border border-[#333] rounded p-1 w-fit">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#999] uppercase mb-1">Duration</label>
                  <select
                    value={durationChoice}
                    onChange={(e) => setDurationChoice(e.target.value)}
                    className={editInputClass}
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
                      className={editInputClass}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#999] uppercase mb-1">Amount</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    required
                    className={editInputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#999] uppercase mb-1">Receipt No.</label>
                  <input
                    type="text"
                    value={markPaidReceiptNo}
                    onChange={(e) => setMarkPaidReceiptNo(e.target.value)}
                    placeholder="optional"
                    className={editInputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Payment Mode (optional)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode(paymentMode === 'cash' ? '' : 'cash')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded border text-sm font-bold uppercase transition-colors ${
                      paymentMode === 'cash'
                        ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
                        : 'border-[#333] text-[#999] hover:border-[#555]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode(paymentMode === 'upi' ? '' : 'upi')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded border text-sm font-bold uppercase transition-colors ${
                      paymentMode === 'upi'
                        ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
                        : 'border-[#333] text-[#999] hover:border-[#555]'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    UPI
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={markPaidStatus !== 'idle'}
                className={`font-bold uppercase py-2.5 rounded transition-colors flex items-center justify-center gap-2 ${
                  markPaidStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-[#F2C230] text-black hover:bg-[#C6FF3D]'
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
                {markPaidStatus === 'idle' && 'Confirm Payment'}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {showEdit && (
        <Modal onClose={handleRequestCloseEdit}>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-wide mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#F2C230]" strokeWidth={3} />
              Edit {member.name}
            </h2>

            {editError && <p className="text-red-400 text-sm mb-3">{editError}</p>}

            <form onSubmit={handleEditSubmit} className="grid sm:grid-cols-2 gap-4">
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
                    className="bg-[#0D0D0D] border border-[#333] rounded-r px-3 py-2 text-sm w-full text-[#F5F5F0] focus:outline-none focus:border-[#F2C230]"
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
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#999] uppercase mb-1">Receipt No.</label>
                <input
                  value={editData.receiptNo}
                  onChange={(e) => setEditData({ ...editData, receiptNo: e.target.value })}
                  placeholder="optional"
                  className={editInputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#999] uppercase mb-1">Payment Mode (optional)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditData({ ...editData, paymentMode: editData.paymentMode === 'cash' ? '' : 'cash' })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded border text-sm font-bold uppercase transition-colors ${
                      editData.paymentMode === 'cash'
                        ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
                        : 'border-[#333] text-[#999] hover:border-[#555]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditData({ ...editData, paymentMode: editData.paymentMode === 'upi' ? '' : 'upi' })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded border text-sm font-bold uppercase transition-colors ${
                      editData.paymentMode === 'upi'
                        ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
                        : 'border-[#333] text-[#999] hover:border-[#555]'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    UPI
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={editStatus !== 'idle'}
                className={`sm:col-span-2 text-sm font-bold uppercase py-2.5 rounded transition-colors flex items-center justify-center gap-2 ${
                  editStatus === 'success'
                    ? 'bg-sky-400 text-black'
                    : 'bg-[#F2C230] text-black hover:bg-[#C6FF3D]'
                } ${editStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {editStatus === 'submitting' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                )}
                {editStatus === 'success' && (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                )}
                {editStatus === 'idle' && 'Save Changes'}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {confirmDiscardEdit && (
        <ConfirmDialog
          title="Discard Changes?"
          message={`You have unsaved edits for ${member.name}. Closing now will discard them.`}
          confirmLabel="Discard"
          danger
          onConfirm={handleConfirmDiscardEdit}
          onCancel={() => setConfirmDiscardEdit(false)}
        />
      )}

      {confirmDiscardMarkPaid && (
        <ConfirmDialog
          title="Discard Changes?"
          message={`You've entered payment details for ${member.name} that haven't been saved. Closing now will discard them.`}
          confirmLabel="Discard"
          danger
          onConfirm={handleConfirmDiscardMarkPaid}
          onCancel={() => setConfirmDiscardMarkPaid(false)}
        />
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

export default memo(MemberCard);