import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, XCircle, LogOut, Search, FileText, Loader2, ChevronDown, BarChart3 } from 'lucide-react';
import api from '../api/axiosConfig';
import AddMemberForm from '../components/AddMemberForm';
import MemberRow from '../components/MemberRow';
import MemberCard from '../components/MemberCard';
import SkeletonCard from '../components/SkeletonCard';
import SkeletonRow from '../components/SkeletonRow';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { fuzzyMatchesName } from '../utils/fuzzySearch';

async function getClientDeviceModel() {
  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const { model } = await navigator.userAgentData.getHighEntropyValues(['model']);
      return model || null;
    } catch {
      return null;
    }
  }
  return null;
}

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true); // true only until the first successful load
  const [error, setError] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const [hideInactive, setHideInactive] = useState(true);

  function fetchMembers() {
    // Only the very first load should show a loading state — every refetch
    // after that (add/edit/mark-paid/etc. via onUpdated) happens quietly in
    // the background so the whole dashboard doesn't flash back to a splash
    // screen every time an admin taps a button.
    if (!hasLoadedOnce) setLoading(true);
    api.get('/members')
      .then((response) => {
        setMembers(response.data);
        setLoading(false);
        setHasLoadedOnce(true);
      })
      .catch((err) => {
        setError('Failed to load members');
        setLoading(false);
        setHasLoadedOnce(true);
      });
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const deviceModel = await getClientDeviceModel();
      await logout(deviceModel);
    } catch (err) {
      setIsLoggingOut(false); // only reset on failure — on success the page redirects away anyway
    }
  }

  if (error) return <p className="p-8 text-red-400">{error}</p>;

  const counts = {
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    inactive: members.filter((m) => m.status === 'inactive' || m.status === 'not_renewing').length
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
            .filter((m) => !hideInactive || (m.status !== 'inactive' && m.status !== 'not_renewing'))
            .sort((a, b) => b.daysPastExpiry - a.daysPastExpiry)
        : filter === 'inactive'
        ? members
            .filter((m) => m.status === 'inactive' || m.status === 'not_renewing')
            .sort((a, b) => a.daysPastExpiry - b.daysPastExpiry)
        : members.filter((m) => m.status === filter);

  const searchTerm = search.trim().toLowerCase();

const filteredMembers = searchTerm
  ? statusFiltered.filter((m) =>
      m.gymCode.toLowerCase().includes(searchTerm) ||
      fuzzyMatchesName(m.name, searchTerm)
    )
  : statusFiltered;

  const statCards = [
    { label: 'Active', value: counts.active, icon: Users, color: '#C6FF3D', filterKey: 'active' },
    { label: 'Pending', value: counts.pending, icon: Clock, color: '#F2C230', filterKey: 'pending' },
    { label: 'Inactive', value: counts.inactive, icon: XCircle, color: '#EF4444', filterKey: 'inactive' }
  ];

  return (
    <div className="min-h-screen bg-black text-[#F5F5F0]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex justify-between items-center mb-6 gap-3">
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight truncate">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/admin/logs"
              className="flex items-center gap-2 text-sm text-[#999] hover:text-[#F2C230] transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Activity Log</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-2 text-sm text-[#999] hover:text-[#F2C230] transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 text-sm text-[#999] hover:text-[#F2C230] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isLoggingOut ? 'Logging Out...' : 'Log Out'}
              </span>
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
          {statCards.map(({ label, value, icon: Icon, color, filterKey }) => {
            const isSelected = filter === filterKey;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setFilter(isSelected ? 'all' : filterKey)}
                style={{ borderColor: isSelected ? color : '#2A2A2A' }}
                className="text-left bg-[#1A1A1A] border-2 rounded-lg p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              >
                <Icon style={{ color }} className="w-5 h-5 md:w-8 md:h-8 shrink-0" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xl md:text-2xl font-black">{value}</p>
                  <p className="text-[10px] md:text-xs uppercase tracking-wide text-[#999] truncate">
                    {label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#F2C230] text-black font-bold uppercase px-5 py-2.5 rounded hover:bg-[#C6FF3D] hover:-translate-y-0.5 transition-all mb-4"
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
  <div className="relative">
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="appearance-none bg-[#1A1A1A] text-[#F5F5F0] text-sm font-bold uppercase tracking-wide border border-[#333] rounded px-4 py-2 pr-9 cursor-pointer hover:border-[#555] transition-colors focus:outline-none focus:border-[#F2C230]"
    >
      {filters.map(({ key, label }) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
    <ChevronDown className="w-4 h-4 text-[#999] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
        <div className="hidden md:block bg-[#1A1A1A] border border-[#F2C230]/20 rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111] text-[#999] text-xs uppercase tracking-wide">
              <tr>
                <th className="border border-[#2A2A2A] px-4 py-3">Code</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Name</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Residence</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Status</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Start Date</th>
                <th className="border border-[#2A2A2A] px-4 py-3">End Date</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Days Past</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Amount Paid</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Actions</th>
              </tr>
            </thead>
            {loading && (
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            )}
            {!loading && filteredMembers.length === 0 && (
              <tbody>
                <tr>
                    <td colSpan="9">
                    <EmptyState
                      icon={Users}
                      title="No members found"
                      message={search ? 'Try a different search.' : 'Add your first member to get started.'}
                    />
                  </td>
                </tr>
              </tbody>
            )}
            {!loading && filteredMembers.length > 0 && filteredMembers.map((member) => (
              <MemberRow key={member._id} member={member} onUpdated={fetchMembers} />
            ))}
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members found"
              message={search ? 'Try a different search.' : 'Add your first member to get started.'}
            />
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