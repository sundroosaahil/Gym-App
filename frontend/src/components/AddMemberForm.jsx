import { useState } from 'react';
import { Plus } from 'lucide-react';
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
    customDays: ''
  });
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const durationDays =
      formData.durationChoice === 'custom'
        ? Number(formData.customDays)
        : Number(formData.durationChoice);

    // formData.phone is just the 10-digit local number the staff typed —
    // toFullPhone adds the +91 country code before it's stored/sent.
    const cleanedPhone = toFullPhone(formData.phone);

    try {
      await api.post('/members', {
        name: formData.name,
        residence: formData.residence,
        phone: cleanedPhone,
        amountPaid: Number(formData.amountPaid),
        startDate: formData.startDate,
        durationDays
      });

      setFormData({
        name: '',
        residence: '',
        phone: '',
        amountPaid: '',
        startDate: '',
        durationChoice: '30',
        customDays: ''
      });

      onMemberAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
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
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          name="residence"
          placeholder="Residence"
          value={formData.residence}
          onChange={handleChange}
          className={inputClass}
        />
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

        <button
          type="submit"
          className="md:col-span-3 bg-[#F2C230] text-black font-bold uppercase py-2.5 rounded hover:bg-[#C6FF3D] transition-colors"
        >
          Add Member
        </button>
      </form>
    </div>
  );
}

export default AddMemberForm;