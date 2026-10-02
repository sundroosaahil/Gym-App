import { useState } from 'react';
import { Plus, Loader2, Check, Banknote, QrCode } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import { toFullPhone } from '../utils/formatPhone';
import { useToast } from '../context/ToastContext';
import PlaceAutocomplete from './PlaceAutocomplete';
import DateField from './DateField';

function AddMemberForm({ onMemberAdded }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    residence: '',
    phone: '',
    amountPaid: '',
    startDate: '',
    durationChoice: '30',
    customDays: '',
    receiptNo: '',
    paymentMode: ''
  });
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [duplicateMatches, setDuplicateMatches] = useState([]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }
    if (name === 'firstName' || name === 'lastName' || name === 'residence') {
      setDuplicateMatches([]); // stale warning — clear until re-checked on blur
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function togglePaymentMode(value) {
    setFormData((prev) => ({
      ...prev,
      paymentMode: prev.paymentMode === value ? '' : value
    }));
  }

  async function handleDuplicateCheck() {
    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedResidence = formData.residence.trim();
    if (!trimmedFirstName || !trimmedResidence) {
      setDuplicateMatches([]);
      return;
    }
    try {
      const res = await api.get('/members/check-duplicate', {
        params: { firstName: trimmedFirstName, lastName: trimmedLastName, residence: trimmedResidence }
      });
      setDuplicateMatches(res.data.matches || []);
    } catch (err) {
      // Non-critical — if the check itself fails, don't block the admin from adding
      setDuplicateMatches([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitStatus !== 'idle') return; // guard against double-submit
    setError(null);
    setSubmitStatus('submitting');

    const durationDays =
      formData.durationChoice === 'custom'
        ? Number(formData.customDays)
        : Number(formData.durationChoice);

    const cleanedPhone = toFullPhone(formData.phone);

    try {
      await api.post('/members', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        residence: formData.residence,
        phone: cleanedPhone,
        amountPaid: Number(formData.amountPaid),
        startDate: formData.startDate,
        durationDays,
        ...(formData.receiptNo.trim() && { receiptNo: formData.receiptNo.trim() }),
        ...(formData.paymentMode && { paymentMode: formData.paymentMode })
      });

      setSubmitStatus('success');
      showToast(`${formData.firstName} ${formData.lastName}`.trim() + ' added');
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          residence: '',
          phone: '',
          amountPaid: '',
          startDate: '',
          durationChoice: '30',
          customDays: '',
          receiptNo: '',
          paymentMode: ''
        });
        setDuplicateMatches([]);
        setSubmitStatus('idle');
        onMemberAdded();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
      setSubmitStatus('idle');
    }
  }

  const inputClass =
    'h-11 w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 text-sm text-[#F5F5F0] placeholder-[#666] focus:outline-none focus:border-[#F2C230]';
  const labelClass = 'block text-[11px] font-bold uppercase text-[#999] mb-1.5';

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 sm:p-5">
      <h2 className="text-lg font-black uppercase mb-5 flex items-center gap-2">
        <Plus className="w-5 h-5 text-[#F2C230]" strokeWidth={3} />
        Add Member
      </h2>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <label className={labelClass}>
          First name
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleDuplicateCheck}
            required
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <label className={labelClass}>
          Last name <span className="normal-case font-normal">optional</span>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleDuplicateCheck}
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <label className={labelClass}>
          Residence
          <PlaceAutocomplete
            name="residence"
            value={formData.residence}
            onChange={(value) => handleChange({ target: { name: 'residence', value } })}
            onBlur={handleDuplicateCheck}
            className={`${inputClass} mt-1.5`}
          />
          {duplicateMatches.length > 0 && (
            <p className="text-yellow-400 text-xs font-normal normal-case mt-1.5 leading-relaxed">
              ⚠ Already exists: {duplicateMatches.map((m) => `${m.firstName} ${m.lastName}`.trim() + ` (${m.gymCode})`).join(', ')}
            </p>
          )}
        </label>
        <label className={labelClass}>
          Phone
          <div className="flex mt-1.5">
          <span className="h-11 flex items-center bg-[#111] border border-r-0 border-[#333] rounded-l-lg px-3 text-sm text-[#999]">
            +91
          </span>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={formData.phone}
            onChange={handleChange}
            required
            className={`${inputClass} rounded-l-none`}
          />
          </div>
        </label>
        <label className={labelClass}>
          Amount paid
          <input
            name="amountPaid"
            type="number"
            min="0"
            value={formData.amountPaid}
            onChange={handleChange}
            required
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <label className={labelClass}>
          Start date
          <DateField
            value={formData.startDate}
            onChange={(value) => handleChange({ target: { name: 'startDate', value } })}
            ariaLabel="Start date"
            className="mt-1.5"
          />
        </label>
        <label className={labelClass}>
          Membership duration
          <select
            name="durationChoice"
            value={formData.durationChoice}
            onChange={handleChange}
            className={`${inputClass} mt-1.5`}
          >
            {durationOptions.map((opt) => (
              <option key={opt.label} value={opt.days}>
                {opt.label}
              </option>
            ))}
          </select>

          {formData.durationChoice === 'custom' && (
          <input
            name="customDays"
            type="number"
            placeholder="Number of days"
            value={formData.customDays}
            onChange={handleChange}
            required
            className={`${inputClass} mt-2`}
          />
          )}
        </label>

        <label className={labelClass}>
          Receipt number <span className="normal-case font-normal">optional</span>
          <input
            name="receiptNo"
            value={formData.receiptNo}
            onChange={handleChange}
            className={`${inputClass} mt-1.5`}
          />
        </label>

        <div className="sm:col-span-2">
          <label className={labelClass}>Payment mode <span className="normal-case font-normal">optional</span></label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => togglePaymentMode('cash')}
              className={`h-11 flex-1 flex items-center justify-center gap-2 rounded-xl border text-sm font-bold uppercase transition-colors ${
                formData.paymentMode === 'cash'
                  ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
                  : 'border-[#333] text-[#999] hover:border-[#555]'
              }`}
            >
              <Banknote className="w-4 h-4" />
              Cash
            </button>
            <button
              type="button"
              onClick={() => togglePaymentMode('upi')}
              className={`h-11 flex-1 flex items-center justify-center gap-2 rounded-xl border text-sm font-bold uppercase transition-colors ${
                formData.paymentMode === 'upi'
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
          disabled={submitStatus !== 'idle'}
          className={`h-11 sm:col-span-2 font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2 ${
            submitStatus === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-[#F2C230] text-black hover:bg-[#C6FF3D]'
          } ${submitStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {submitStatus === 'submitting' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          )}
          {submitStatus === 'success' && (
            <>
              <Check className="w-4 h-4" />
              Added!
            </>
          )}
          {submitStatus === 'idle' && 'Add Member'}
        </button>
      </form>
    </div>
  );
}

export default AddMemberForm;