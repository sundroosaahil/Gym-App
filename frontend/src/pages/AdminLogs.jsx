import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axiosConfig';
import LoadingScreen from '../components/LoadingScreen';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');

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

  // Built from whatever logs actually came back, so this dropdown never
  // goes out of sync with the real action strings the backend writes.
  const actionOptions = useMemo(
    () => ['all', ...new Set(logs.map((log) => log.action))],
    [logs]
  );

  const adminOptions = useMemo(
    () => ['all', ...new Set(logs.map((log) => log.adminEmail))],
    [logs]
  );

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesAdmin = adminFilter === 'all' || log.adminEmail === adminFilter;
    return matchesAction && matchesAdmin;
  });

  const selectClass =
    'bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#F2C230]';

  if (loading) return <LoadingScreen />;
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
        <p className="text-xs text-[#666] mb-6">Logs are automatically deleted after 30 days.</p>

        {logs.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div>
              <label className="block text-xs text-[#999] uppercase mb-1">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className={selectClass}
              >
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#999] uppercase mb-1">Admin</label>
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className={selectClass}
              >
                {adminOptions.map((admin) => (
                  <option key={admin} value={admin}>
                    {admin === 'all' ? 'All Admins' : admin}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <p className="text-[#666]">No activity matches these filters.</p>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log._id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-bold text-[#F2C230] text-sm uppercase tracking-wide">
                      {log.action}
                    </p>
                    <p className="text-sm text-[#F5F5F0] mt-1">{log.details}</p>
                    <p className="text-xs text-[#666] mt-1">by {log.adminEmail}</p>
                  </div>
                  <p className="text-xs text-[#999] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
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