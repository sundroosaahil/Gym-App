import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Trophy, Info, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axiosConfig';
import BarChart from '../components/analytics/BarChart';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

const MEDAL_STYLES = [
  { bg: '#F2C230', text: '#000', ring: 'ring-2 ring-[#F2C230]' },   // gold
  { bg: '#C4C4C4', text: '#000', ring: 'ring-2 ring-[#C4C4C4]' },   // silver
  { bg: '#B87333', text: '#000', ring: 'ring-2 ring-[#B87333]' }    // bronze
];

function AnalyticsPage() {
  const [revenue, setRevenue] = useState(null);
  const [newJoins, setNewJoins] = useState(null);
  const [atRisk, setAtRisk] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRisk, setShowAllRisk] = useState(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);

  useEffect(() => {
    async function loadAll() {
      try {
        const [revRes, joinsRes, riskRes, boardRes] = await Promise.all([
          api.get('/analytics/revenue'),
          api.get('/analytics/new-joins'),
          api.get('/analytics/revenue-at-risk'),
          api.get('/analytics/leaderboard')
        ]);
        setRevenue(revRes.data);
        setNewJoins(joinsRes.data);
        setAtRisk(riskRes.data);
        setLeaderboard(boardRes.data);
      } catch (err) {
        setError('Could not load analytics. Try refreshing.');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#F5F5F0]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header — diagonal stripe accent ties this back to the brand identity
            used on the public landing page, which the plain card layout was missing. */}
        <div className="relative overflow-hidden rounded-lg border-2 border-[#333] bg-[#111] mb-6 px-6 py-6">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(135deg, #F2C230 0px, #F2C230 2px, transparent 2px, transparent 14px)'
            }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <Link to="/admin" className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#F2C230] transition-colors mb-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight">Analytics</h1>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <EmptyState icon={AlertTriangle} title="Something went wrong" message={error} />
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* Manual-entry disclaimer — visible on every load, not dismissible. */}
            <div className="flex items-start gap-2 bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-xs text-[#999]">
              <Info className="w-4 h-4 text-[#F2C230] shrink-0 mt-0.5" />
              <span>
                Figures are based on manually entered payment data and may contain occasional errors.
                Treat as directional, not exact accounting.
              </span>
            </div>

            {/* Revenue — 12 months */}
            <div className="bg-[#1A1A1A] border-2 border-[#333] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white uppercase tracking-wide text-sm">Revenue — Last 12 Months</h3>
                {revenue.percentChange !== null && (
                  <span className={`flex items-center gap-1 text-sm font-bold ${revenue.percentChange >= 0 ? 'text-[#C6FF3D]' : 'text-red-400'}`}>
                    {revenue.percentChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {revenue.percentChange}%
                  </span>
                )}
              </div>
              <p className="text-xs text-[#666] mb-4">This month vs last, highlighted in lime</p>
              <BarChart
                data={revenue.months.map((m) => ({ label: m.label, value: m.total }))}
                formatValue={(v) => `₹${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
                highlightLast
              />
            </div>

            {/* New joins */}
            <div className="bg-[#1A1A1A] border-2 border-[#333] rounded-lg p-4">
              <h3 className="font-bold text-white uppercase tracking-wide text-sm mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F2C230]" />
                New Joins — Last 12 Months
              </h3>
              <p className="text-xs text-[#666] mb-4">Members who started a membership each month</p>
              <BarChart
                data={newJoins.map((m) => ({ label: m.label, value: m.count }))}
                color="#F2C230"
                highlightColor="#C6FF3D"
                highlightLast
              />
            </div>

            {/* Revenue at risk */}
            <div className="bg-[#1A1A1A] border-2 border-[#333] rounded-lg p-4">
              <h3 className="font-bold text-white uppercase tracking-wide text-sm mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F2C230]" />
                Revenue at Risk
              </h3>
              <p className="text-xs text-[#666] mb-4">
                {atRisk.count} member{atRisk.count !== 1 ? 's' : ''} expiring within 7 days, still marked as renewing
              </p>
              {atRisk.count === 0 ? (
                <EmptyState icon={AlertTriangle} title="Nothing at risk right now" />
              ) : (
                <>
                  <p className="text-2xl font-black text-[#F2C230] mb-3">
                    ₹{atRisk.totalAtRisk.toLocaleString('en-IN')}
                  </p>
                  <div className="space-y-2">
                    {(showAllRisk ? atRisk.members : atRisk.members.slice(0, 3)).map((m) => (
                      <div key={m._id} className="flex justify-between text-sm border-b border-[#2A2A2A] pb-2">
                        <span className="text-white">{m.name} <span className="text-[#666]">#{m.gymCode}</span></span>
                        <span className="text-[#999]">{new Date(m.endDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  {atRisk.members.length > 3 && (
                    <button
                      onClick={() => setShowAllRisk((v) => !v)}
                      className="flex items-center gap-1 text-xs text-[#F2C230] hover:text-[#C6FF3D] transition-colors mt-3 font-bold uppercase tracking-wide"
                    >
                      {showAllRisk ? (
                        <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Show all {atRisk.members.length} <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Leaderboard — medal colors for top 3 */}
            <div className="bg-[#1A1A1A] border-2 border-[#333] rounded-lg p-4">
              <h3 className="font-bold text-white uppercase tracking-wide text-sm mb-1 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F2C230]" />
                Top 10 by Payments Logged
              </h3>
              <p className="text-xs text-[#666] mb-4">
                Based on receipts recorded since the receipt feature was added — older payment history isn't included.
              </p>
              {leaderboard.length === 0 ? (
                <EmptyState icon={Trophy} title="No receipts logged yet" />
              ) : (
                <>
                  <div className="space-y-2">
                    {(showAllLeaderboard ? leaderboard : leaderboard.slice(0, 3)).map((m, i) => {
                      const medal = MEDAL_STYLES[i];
                      return (
                        <div
                          key={m._id}
                          className={`flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-lg px-3 py-2.5 hover:-translate-y-0.5 transition-transform ${medal ? medal.ring : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-black shrink-0"
                              style={medal ? { backgroundColor: medal.bg, color: medal.text } : { backgroundColor: '#2A2A2A', color: '#999' }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-white font-bold text-sm">{m.name}</span>
                            <span className="text-[#666] text-xs hidden sm:inline">#{m.gymCode}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[#C6FF3D] font-bold text-sm">₹{m.totalPaid.toLocaleString('en-IN')}</p>
                            <p className="text-[#666] text-[10px]">{m.paymentCount} payment{m.paymentCount !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {leaderboard.length > 3 && (
                    <button
                      onClick={() => setShowAllLeaderboard((v) => !v)}
                      className="flex items-center gap-1 text-xs text-[#F2C230] hover:text-[#C6FF3D] transition-colors mt-3 font-bold uppercase tracking-wide"
                    >
                      {showAllLeaderboard ? (
                        <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Show all {leaderboard.length} <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;