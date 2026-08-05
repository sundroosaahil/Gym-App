import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, XCircle, LogOut, Search, FileText } from 'lucide-react';
import api from '../api/axiosConfig';
import AddMemberForm from '../components/AddMemberForm';
import MemberRow from '../components/MemberRow';
import MemberCard from '../components/MemberCard';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { logout } = useAuth();
  const [hideInactive, setHideInactive] = useState(true);

  function fetchMembers() {
    setLoading(true);
    api.get('/members')
      .then((response) => {
        setMembers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load members');
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <p className="p-8 text-red-400">{error}</p>;

  const counts = {
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    inactive: members.filter((m) => m.status === 'inactive').length
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'renewals', label: 'Renewals' }
  ];

 const statusFiltered =
      filter === 'all'
        ? members
        : filter === 'renewals'
        ? [...members]
            .filter((m) => !hideInactive || m.status !== 'inactive')
            .sort((a, b) => b.daysPastExpiry - a.daysPastExpiry)
        : members.filter((m) => m.status === filter);

  const searchTerm = search.trim().toLowerCase();

const filteredMembers = searchTerm
  ? statusFiltered.filter((m) =>
      m.name.toLowerCase().includes(searchTerm) ||
      m.gymCode.toLowerCase().includes(searchTerm) 
    )
  : statusFiltered;

  const statCards = [
    { label: 'Active', value: counts.active, icon: Users, color: '#C6FF3D' },
    { label: 'Pending', value: counts.pending, icon: Clock, color: '#F2C230' },
    { label: 'Inactive', value: counts.inactive, icon: XCircle, color: '#EF4444' }
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex justify-between items-center mb-4 gap-3">
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight truncate">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/admin/logs"
              className="flex items-center gap-2 text-sm text-[#999] hover:text-[#F5F5F0] transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Activity Log</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-[#999] hover:text-[#F5F5F0] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
          <input
            type="text"
            placeholder="Search by name, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border-2 border-[#333] rounded-lg pl-12 pr-4 py-3.5 text-base placeholder-[#666] focus:outline-none focus:border-[#F2C230] transition-colors"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-4 overflow-hidden"
            >
              <Icon style={{ color }} className="w-5 h-5 md:w-8 md:h-8 shrink-0" strokeWidth={2} />
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-black">{value}</p>
                <p className="text-[10px] md:text-xs uppercase tracking-wide text-[#999] truncate">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#F2C230] text-black font-bold uppercase px-5 py-2.5 rounded hover:bg-[#C6FF3D] transition-colors mb-4"
        >
          {showAddForm ? 'Cancel' : '+ Add Member'}
        </button>

        {showAddForm && (
          <AddMemberForm
            onMemberAdded={() => {
              fetchMembers();
              setShowAddForm(false);
            }}
          />
        )}

<div className="flex flex-wrap items-center justify-between gap-3 mb-4 mt-8">
  <div className="flex gap-2 flex-wrap">
    {filters.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => setFilter(key)}
        className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wide transition-colors ${
          filter === key
            ? 'bg-[#F2C230] text-black'
            : 'bg-[#1A1A1A] text-[#999] hover:text-[#F5F5F0]'
        }`}
      >
        {label}
      </button>
    ))}
  </div>

  {filter === 'renewals' && (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-xs text-[#999] uppercase tracking-wide">Hide Inactive</span>
      <button
        type="button"
        onClick={() => setHideInactive(!hideInactive)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          hideInactive ? 'bg-[#C6FF3D]' : 'bg-[#333]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            hideInactive ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )}
</div>

        {/* Desktop table */}
        <div className="hidden md:block bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#111] text-[#999] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Residence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Days Past</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-[#666]">
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <MemberRow key={member._id} member={member} onUpdated={fetchMembers} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-[#666] py-8">No members found.</p>
          ) : (
            filteredMembers.map((member) => (
              <MemberCard key={member._id} member={member} onUpdated={fetchMembers} />
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;