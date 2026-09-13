import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Search,
  LogIn,
  LogOut,
  UserPlus,
  Pencil,
  Trash2,
  IndianRupee,
  UserX,
  RotateCcw
} from 'lucide-react';
import api from '../api/axiosConfig';
import SkeletonLogCard from '../components/SkeletonLogCard';

// Icon + color per action, so the log feed is skimmable at a glance instead
// of every row looking identical except for the label text. Keyed on the
// exact strings passed to logAction() across the backend routes.
const ACTION_META = {
  'Logged In': { icon: LogIn, color: '#7DD3FC' },
  'Logged Out': { icon: LogOut, color: '#999999' },
  'Logged Out (All Devices)': { icon: LogOut, color: '#999999' },
  'Added Member': { icon: UserPlus, color: '#C6FF3D' },
  'Edited Member': { icon: Pencil, color: '#F2C230' },
  'Deleted Member': { icon: Trash2, color: '#EF4444' },
  'Marked Paid': { icon: IndianRupee, color: '#C6FF3D' },
  'Marked Not Renewing': { icon: UserX, color: '#F97316' },
  'Reactivated': { icon: RotateCcw, color: '#38BDF8' }
};
const DEFAULT_ACTION_META = { icon: Activity, color: '#999999' };

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Day-group headers: "Today" / "Yesterday" for the two most recent days,
// then a plain formatted date for anything older.
function getDayLabel(date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Relative time ONLY for today's entries ("5m ago", "2h ago") since that's
// where freshness actually matters. Anything outside today falls back to a
// plain time-of-day, since the day-group header above it already carries
// the date — repeating "3d ago" under a "Sept 3, 2026" header is redundant
// and less precise than just showing the clock time.
function formatLogTimestamp(date) {
  const now = new Date();
  if (!isSameDay(date, now)) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  const diffSeconds = Math.floor((now - date) / 1000);
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
}

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/logs')
      .then((response) => {
        setLogs(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load logs');
        setLoading(false);
      });
  }, []);

  const actionOptions = useMemo(
    () => ['all', ...new Set(logs.map((log) => log.action))],
    [logs]
  );

  const adminOptions = useMemo(() => {
    const map = new Map();
    logs.forEach((log) => {
      if (!map.has(log.adminEmail)) {
        map.set(log.adminEmail, log.adminName || log.adminEmail);
      }
    });
    return [{ email: 'all', label: 'All Admins' }, ...Array.from(map, ([email, label]) => ({ email, label }))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesAdmin = adminFilter === 'all' || log.adminEmail === adminFilter;
      const matchesSearch =
        query === '' ||
        (log.details || '').toLowerCase().includes(query) ||
        (log.action || '').toLowerCase().includes(query) ||
        (log.adminName || log.adminEmail || '').toLowerCase().includes(query);
      return matchesAction && matchesAdmin && matchesSearch;
    });
  }, [logs, actionFilter, adminFilter, searchQuery]);

  // Bucket the already-sorted (newest-first) log list into day groups,
  // preserving order. Logs within a day stay in their existing order.
  const groupedLogs = useMemo(() => {
    const groups = [];
    let currentKey = null;
    filteredLogs.forEach((log) => {
      const date = new Date(log.createdAt);
      const key = date.toDateString();
      if (key !== currentKey) {
        groups.push({ label: getDayLabel(date), entries: [] });
        currentKey = key;
      }
      groups[groups.length - 1].entries.push(log);
    });
    return groups;
  }, [filteredLogs]);

  const selectClass =
    'bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#F2C230]';

  if (error) return <p className="p-8 text-red-400">{error}</p>;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-[#999] hover:text-[#F5F5F0] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
          Admin Activity Log
        </h1>
        <p className="text-xs text-[#666] mb-6">Logs are automatically deleted after 60 days.</p>

        {!loading && logs.length > 0 && (
          <>
            {/* Sticky like the search bar on AdminDashboard — stays pinned
                under the header while scrolling a long log list. Only the
                search box sticks; filters below scroll normally, same
                split as the dashboard. */}
            <div className="sticky top-0 z-30 bg-[#0D0D0D] pt-2 pb-4 -mx-6 px-6 md:static md:mx-0 md:px-0 md:pt-0 md:pb-0 md:mb-3">
              <label className="block text-xs text-[#999] uppercase mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search details, action, admin..."
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded pl-9 pr-3 py-2 text-sm text-[#F5F5F0] placeholder-[#666] focus:outline-none focus:border-[#F2C230]"
                />
              </div>
            </div>

            {/* Action + Admin grouped in their own row so they always sit
                side by side, even on narrow phones — relying on flex-wrap
                alone let them fall onto separate stacked rows once the
                search box above claimed the full first line. */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 sm:flex-none sm:w-auto min-w-0">
                <label className="block text-xs text-[#999] uppercase mb-1">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className={`${selectClass} w-full`}
                >
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action === 'all' ? 'All Actions' : action}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 sm:flex-none sm:w-auto min-w-0">
                <label className="block text-xs text-[#999] uppercase mb-1">Admin</label>
                <select
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value)}
                  className={`${selectClass} w-full`}
                >
                  {adminOptions.map((opt) => (
                    <option key={opt.email} value={opt.email}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLogCard key={i} />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="text-[#666]">No activity matches these filters.</p>
        ) : (
          <div className="space-y-5">
            {groupedLogs.map((group) => (
              <div key={group.label + group.entries[0]._id}>
                <p className="text-xs font-bold text-[#666] uppercase tracking-wide mb-2">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.entries.map((log) => {
                    const meta = ACTION_META[log.action] || DEFAULT_ACTION_META;
                    const Icon = meta.icon;
                    const date = new Date(log.createdAt);
                    return (
                      <div
                        key={log._id}
                        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${meta.color}22` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: meta.color }} />
                          </span>
                          <div className="flex-1 min-w-0 flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-[#F2C230] text-sm uppercase tracking-wide">
                                {log.action}
                              </p>
                              <p className="text-sm text-[#F5F5F0] mt-1 break-words">{log.details}</p>
                              <p className="text-xs text-[#666] mt-1">by {log.adminName || log.adminEmail}</p>
                            </div>
                            <p
                              className="text-xs text-[#999] whitespace-nowrap"
                              title={date.toLocaleString()}
                            >
                              {formatLogTimestamp(date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogs;