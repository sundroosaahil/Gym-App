import { useState } from 'react';
import { IndianRupee, Banknote, QrCode, Loader2, Check, ChevronDown } from 'lucide-react';
import api from '../api/axiosConfig';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import StartDatePicker from './StartDatePicker';
import { durationOptions } from '../constants/durationOptions';
import { useToast } from '../context/ToastContext';
import { getDisplayName } from '../utils/getDisplayName';
import { fromDateInputValue, toDateInputValue } from '../utils/dateInput';

// One Mark Paid screen, shared by MemberCard (mobile) and MemberRow (desktop)
// so the two can never drift apart. It owns its own form state: the parent
// only decides when it is open (mount it to open, unmount on onClose).
//
// Payment comes first; membership settings and the cycle summary follow.

const fieldClass =
  'h-11 w-full rounded-lg border border-[#333] bg-[#0D0D0D] px-3 text-sm text-[#F5F5F0] placeholder-[#666] focus:outline-none focus:border-[#F2C230] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const chipClass = (selected) =>
  `transition-colors rounded-xl border text-sm font-bold ${
    selected
      ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
      : 'border-[#333] text-[#999] hover:border-[#555]'
  }`;

function Label({ children, hint }) {
  return (
    <label className="flex items-baseline justify-between text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1.5">
      <span>{children}</span>
      {hint && <span className="normal-case tracking-normal font-normal text-[#666]">{hint}</span>}
    </label>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1 h-4 rounded-full bg-[#F2C230]" />
      <h3 className="text-xs font-black uppercase tracking-widest text-[#F5F5F0]">{children}</h3>
    </div>
  );
}

function MarkPaidModal({ member, onClose, onUpdated }) {
  const { showToast } = useToast();

  const dueDateValue = toDateInputValue(member.endDate);
  const todayValue = toDateInputValue(new Date());

  const [startDate, setStartDate] = useState(dueDateValue);
  const [durationChoice, setDurationChoice] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [error, setError] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const isCustom = durationChoice === 'custom';
  const durationDays = isCustom ? Number(customDays) : Number(durationChoice);

  // Live preview of the cycle that will be saved, so a wrong date is spotted
  // before pressing Confirm rather than after.
  const start = fromDateInputValue(startDate);
  const end =
    start && durationDays > 0
      ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + durationDays)
      : null;

  const isDirty =
    startDate !== dueDateValue ||
    durationChoice !== '30' ||
    customDays !== '' ||
    amountPaid !== '' ||
    receiptNo !== '' ||
    paymentMode !== '';

  function handleRequestClose() {
    if (status !== 'idle') return;
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status !== 'idle') return; // guard against double-submit
    setError(null);
    setStatus('submitting');
    try {
      await api.put(`/members/${member._id}/mark-paid`, {
        durationDays,
        amountPaid: Number(amountPaid),
        startDate,
        ...(paymentMode && { paymentMode }),
        ...(receiptNo.trim() && { receiptNo: receiptNo.trim() })
      });
      setStatus('success');
      showToast(`Payment recorded for ${getDisplayName(member)}`);
      setTimeout(() => {
        onClose();
        onUpdated();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark paid');
      setStatus('idle');
    }
  }

  const amountNumber = Number(amountPaid);

  return (
    <>
      <Modal onClose={handleRequestClose} wide>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-[#2A2A2A] sm:px-6 lg:px-7">
            <div className="w-10 h-10 rounded-lg bg-[#F2C230]/10 border border-[#F2C230]/30 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 text-[#F2C230]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black uppercase leading-tight">Record payment</h2>
              <p className="text-sm text-[#999] truncate">
                {getDisplayName(member)} · {member.gymCode}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 sm:p-5 lg:gap-6 lg:p-7">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <section>
              <SectionTitle>Membership period</SectionTitle>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
                <div>
                  <Label>Start date</Label>
                  <StartDatePicker
                    value={startDate}
                    onChange={setStartDate}
                    dueDate={dueDateValue}
                    today={todayValue}
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <div className="relative">
                    <select
                      value={durationChoice}
                      onChange={(e) => setDurationChoice(e.target.value)}
                      className={`${fieldClass} appearance-none pr-10 font-semibold`}
                      aria-label="Membership duration"
                    >
                      {durationOptions.map((option) => (
                        <option key={option.label} value={String(option.days)}>
                          {option.label.replace(' (days)', '')}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] pointer-events-none" />
                  </div>
                  {isCustom && (
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Number of days"
                      required
                      aria-label="Custom number of days"
                      className={`${fieldClass} mt-2`}
                    />
                  )}
                </div>
              </div>
            </section>

            <section>
              <SectionTitle>Payment</SectionTitle>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <div>
                  <Label>Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#F2C230] pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0"
                      required
                      className={`${fieldClass} pl-7 font-bold`}
                    />
                  </div>
                </div>
                <div>
                  <Label hint="optional">Receipt No.</Label>
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    placeholder="—"
                    className={fieldClass}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label hint="optional">Paid via</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'cash', label: 'Cash', Icon: Banknote },
                      { value: 'upi', label: 'UPI', Icon: QrCode }
                    ].map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPaymentMode(paymentMode === value ? '' : value)}
                        className={`h-11 flex items-center justify-center gap-2 uppercase ${chipClass(paymentMode === value)}`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={status !== 'idle'}
              className={`min-h-12 rounded-lg font-black uppercase transition-colors flex items-center justify-center gap-2 py-2 ${
                status === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-[#F2C230] text-black hover:bg-[#C6FF3D]'
              } ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {status === 'submitting' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              )}
              {status === 'success' && (
                <>
                  <Check className="w-4 h-4" />
                  Done!
                </>
              )}
              {status === 'idle' && (
                <span className="flex flex-col items-center leading-tight">
                  <span>{amountNumber > 0 ? `Confirm payment · ₹${amountNumber.toLocaleString('en-IN')}` : 'Confirm payment'}</span>
                  {start && end && (
                    <span className="mt-1 text-xs font-medium normal-case opacity-75">
                      Cycle: {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </span>
              )}
            </button>
          </form>
        </div>
      </Modal>

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard Changes?"
          message={`You've entered payment details for ${getDisplayName(member)} that haven't been saved. Closing now will discard them.`}
          confirmLabel="Discard"
          danger
          onConfirm={() => {
            setConfirmDiscard(false);
            onClose();
          }}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </>
  );
}

export default MarkPaidModal;