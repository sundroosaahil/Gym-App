import { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import { durationOptions } from '../constants/durationOptions';

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const durationDays =
      formData.durationChoice === 'custom'
        ? Number(formData.customDays)
        : Number(formData.durationChoice);

    try {
      await api.post('/members', {
        name: formData.name,
        residence: formData.residence,
        phone: formData.phone,
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
    'bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm w-full placeholder-[#666] focus:outline-none focus:border-[#F2C230]';

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
        <input
          name="phone"
          placeholder="Phone (Optional)"
          value={formData.phone}
          onChange={handleChange}
          className={inputClass}
        />
        <input
          name="amountPaid"
          type="number"
          placeholder="Amount Paid"
          value={formData.amountPaid}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
          className={inputClass}
        />
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