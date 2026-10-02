import { useState, useRef, memo } from 'react';
import { Pencil, Trash2, MessageCircle, Loader2, Check, UserX, MapPin, Banknote, QrCode } from 'lucide-react';
import api from '../api/axiosConfig';
import StatusBadge from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import { useInView } from '../hooks/useInView';
import { formatDate } from '../utils/formatDate';
import { buildWhatsAppReminderLink } from '../utils/sendWhatsAppReminder';
import { toFullPhone, toLocalPhone } from '../utils/formatPhone';
import { getRenewalLabel } from '../utils/renewalLabel';
import { useToast } from '../context/ToastContext';
import { getDisplayName } from '../utils/getDisplayName';
import { getMissingDetails } from '../utils/getMissingDetails';
import PlaceAutocomplete from './PlaceAutocomplete';
import MarkPaidModal from './MarkPaidModal';

function MemberCard({ member, isOpen, onToggle, onUpdated }) {
  const [ref, inView] = useInView();
  const { showToast } = useToast();
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notRenewingStatus, setNotRenewingStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'

  const latestReceiptNo =
    member.receipts && member.receipts.length > 0
      ? member.receipts[member.receipts.length - 1].receiptNo
      : null;

  const { color: missingColor, message: missingMessage } = getMissingDetails(member);
  const missingDotClass = missingColor === 'red' ? 'bg-red-400' : 'bg-blue-400';
  const missingTextClass = missingColor === 'red' ? 'text-red-400' : 'text-blue-400';

  const makeEditSnapshot = () => ({
    firstName: member.firstName || '',
    lastName: member.lastName || '',
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
    setShowMarkPaid(true);
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
      showToast(`${getDisplayName(member)} reactivated`);
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
        firstName: editData.firstName,
        lastName: editData.lastName,
        residence: editData.residence,
        phone: toFullPhone(editData.phone),
        amountPaid: Number(editData.amountPaid),
        paymentMode: editData.paymentMode,
        ...(editData.receiptNo.trim() && { receiptNo: editData.receiptNo.trim() })
      });
      setEditStatus('success');
      showToast(`${getDisplayName(member)} updated`);
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
      showToast(`${getDisplayName(member)} deleted`);
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
      <div onClick={() => onToggle(member._id, getDisplayName(member))} className="cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold flex items-center gap-1.5">
              {getDisplayName(member)}
              {missingMessage && (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${missingDotClass}`}
                  title={missingMessage}
                  aria-label={missingMessage}
                />
              )}
            </p>
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
            {missingMessage && (
              <p className={`text-xs ${missingTextClass}`}>{missingMessage}</p>
            )}
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
        <MarkPaidModal
          member={member}
          onClose={() => setShowMarkPaid(false)}
          onUpdated={onUpdated}
        />
      )}

      {showEdit && (
        <Modal onClose={handleRequestCloseEdit}>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-wide mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#F2C230]" strokeWidth={3} />
              Edit {getDisplayName(member)}
            </h2>

            {editError && <p className="text-red-400 text-sm mb-3">{editError}</p>}

            <form onSubmit={handleEditSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">First Name</label>
                <input
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  required
                  className={editInputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Last Name</label>
                <input
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  className={editInputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-[#999] uppercase mb-1">Residence</label>
                <PlaceAutocomplete
                  value={editData.residence}
                  onChange={(value) => setEditData({ ...editData, residence: value })}
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
          message={`You have unsaved edits for ${getDisplayName(member)}. Closing now will discard them.`}
          confirmLabel="Discard"
          danger
          onConfirm={handleConfirmDiscardEdit}
          onCancel={() => setConfirmDiscardEdit(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Member?"
          message={`This will permanently delete ${getDisplayName(member)} (${member.gymCode}). This cannot be undone.`}
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