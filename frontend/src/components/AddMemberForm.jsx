import { useState } from 'react';
import { Plus, Loader2, Check } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';
import { toFullPhone } from '../utils/formatPhone';

function AddMemberForm({ onMemberAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    residence: '',
    phone: '',
    amountPaid: '',
    startDate: '',
    durationChoice: '30',
    customDays: '',
    receiptNo: ''
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
    if (name === 'name' || name === 'residence') {
      setDuplicateMatches([]); // stale warning — clear until re-checked on blur
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleDuplicateCheck() {
    const trimmedName = formData.name.trim();
    const trimmedResidence = formData.residence.trim();
    if (!trimmedName || !trimmedResidence) {
      setDuplicateMatches([]);
      return;
    }
    try {
      const res = await api.get('/members/check-duplicate', {
        params: { name: trimmedName, residence: trimmedResidence }
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
        name: formData.name,
        residence: formData.residence,
        phone: cleanedPhone,
        amountPaid: Number(formData.amountPaid),
        startDate: formData.startDate,
        durationDays,
        ...(formData.receiptNo.trim() && { receiptNo: formData.receiptNo.trim() })
      });

      setSubmitStatus('success');
      setTimeout(() => {
        setFormData({
          name: '',
          residence: '',
          phone: '',
          amountPaid: '',
          startDate: '',
          durationChoice: '30',
          customDays: '',
          receiptNo: ''
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
    'bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm w-full text-[#F5F5F0] placeholder-[#666] focus:outline-none focus:border-[#F2C230]';

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
      <h2 className="text-lg font-black uppercase tracking-wide mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-[#F2C230]" strokeWidth={3} />
        Add Member
      </h2>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
        <div>
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleDuplicateCheck}
            required
            className={inputClass}
          />
        </div>
        <div>
          <input
            name="residence"
            placeholder="Residence"
            value={formData.residence}
            onChange={handleChange}
            onBlur={handleDuplicateCheck}
            className={inputClass}
          />
          {duplicateMatches.length > 0 && (
            <p className="text-yellow-400 text-xs mt-1">
              ⚠ Already exists: {duplicateMatches.map((m) => `${m.name} (${m.gymCode})`).join(', ')}
            </p>
          )}
        </div>
        <div className="flex">
          <span className="flex items-center bg-[#111] border border-r-0 border-[#333] rounded-l px-3 text-sm text-[#999]">
            +91
          </span>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange}
            required
            className="bg-[#1A1A1A] border border-[#333] rounded-r px-3 py-2 text-sm w-full text-[#F5F5F0] placeholder-[#666] focus:outline-none focus:border-[#F2C230]"
          />
        </div>
        <input
          name="amountPaid"
          type="number"
          placeholder="Amount Paid"
          value={formData.amountPaid}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <div className="flex flex-col gap-1">
  <label htmlFor="startDate" className="text-sm text-gray-400">
    Start Date
  </label>
  <input
    id="startDate"
    name="startDate"
    type="date"
    value={formData.startDate}
    onChange={handleChange}
    className={inputClass}
  />
</div>
        <select
          name="durationChoice"
          value={formData.durationChoice}
          onChange={handleChange}
          className={inputClass}
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
            className={inputClass}
          />
        )}

        <input
          name="receiptNo"
          placeholder="Receipt No. (optional)"
          value={formData.receiptNo}
          onChange={handleChange}
          className={inputClass}
        />

        <button
          type="submit"
          disabled={submitStatus !== 'idle'}
          className={`md:col-span-3 font-bold uppercase py-2.5 rounded transition-colors flex items-center justify-center gap-2 ${
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