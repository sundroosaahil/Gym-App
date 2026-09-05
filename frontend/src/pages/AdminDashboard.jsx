import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  XCircle,
  Search,
  FileText,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import api from "../api/axiosConfig";
import AddMemberForm from "../components/AddMemberForm";
import MemberRow from "../components/MemberRow";
import MemberCard from "../components/MemberCard";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonRow from "../components/SkeletonRow";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { fuzzyMatchesName } from "../utils/fuzzySearch";
import LogoutMenu from "../components/LogoutMenu";
import { registerPushNotifications } from "../utils/registerPush";
import { listenForForegroundMessages } from "../firebase";

 
async function getClientDeviceModel() {
  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const { model } = await navigator.userAgentData.getHighEntropyValues([
        "model",
      ]);
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
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, logoutAll } = useAuth();
  const [hideInactive, setHideInactive] = useState(true);

  // Only one member's details/actions panel can be open at a time.
  const [activeMemberId, setActiveMemberId] = useState(null);
  // Tracks which member currently has an edit form open, so we can warn
  // before switching away and silently discarding unsaved changes.
  const [editingMember, setEditingMember] = useState(null); // { id, name } | null
  // The member the admin clicked while an edit was in progress elsewhere —
  // we hold the click here until they confirm or cancel.
  const [pendingSwitch, setPendingSwitch] = useState(null);

  // handleToggleMember/handleEditingChange are passed to EVERY member card.
  // If we redefine them on every render, React.memo on MemberCard/MemberRow
  // is pointless — every card would still re-render on every keystroke in
  // the search box. Keeping them stable (useCallback + refs for the values
  // they need to read) is what lets memo actually skip untouched cards.
  const editingMemberRef = useRef(editingMember);
  useEffect(() => {
    editingMemberRef.current = editingMember;
  }, [editingMember]);

  const handleToggleMember = useCallback((memberId, memberName) => {
    if (editingMemberRef.current) {
      setPendingSwitch({ _id: memberId, name: memberName });
      return;
    }
    if (markPaidMemberRef.current) {
      setShakeMemberId(markPaidMemberRef.current.id);
      setShakeTick((t) => t + 1);
      setBlockedNotice(
        `Please complete or cancel the payment for ${markPaidMemberRef.current.name} to view another member.`
      );
      clearTimeout(blockedNoticeTimerRef.current);
      blockedNoticeTimerRef.current = setTimeout(() => setBlockedNotice(null), 3000);
      return;
    }
    setActiveMemberId((current) => (current === memberId ? null : memberId));
  }, []);

  const handleEditingChange = useCallback((memberId, memberName, isEditing) => {
    setEditingMember(isEditing ? { id: memberId, name: memberName } : null);
  }, []);

  // Tracks which member currently has the Mark Paid form open. While this is
  // set, no other member can be opened/closed — we shake the busy card
  // instead of blocking silently, so the admin gets feedback on why nothing
  // happened.
  const [markPaidMember, setMarkPaidMember] = useState(null); // { id, name } | null
  const [shakeMemberId, setShakeMemberId] = useState(null);
  const [shakeTick, setShakeTick] = useState(0); // bump to retrigger the animation even for the same member
  // Explains *why* clicking another member did nothing, since the shake
  // alone doesn't say which member is blocking or what to do about it.
  const [blockedNotice, setBlockedNotice] = useState(null); // string | null
  const blockedNoticeTimerRef = useRef(null);

  const markPaidMemberRef = useRef(markPaidMember);
  useEffect(() => {
    markPaidMemberRef.current = markPaidMember;
  }, [markPaidMember]);

  useEffect(() => {
    return () => clearTimeout(blockedNoticeTimerRef.current);
  }, []);

  const handleMarkPaidChange = useCallback((memberId, memberName, isMarkingPaid) => {
    setMarkPaidMember(isMarkingPaid ? { id: memberId, name: memberName } : null);
    // The lock just cleared (or moved elsewhere) — whatever notice was
    // showing no longer applies.
    clearTimeout(blockedNoticeTimerRef.current);
    setBlockedNotice(null);
  }, []);

  function handleConfirmSwitch() {
    const clickedId = pendingSwitch._id;
    setEditingMember(null);
    setActiveMemberId((current) => (current === clickedId ? null : clickedId));
    setPendingSwitch(null);
  }

  const hasLoadedOnceRef = useRef(hasLoadedOnce);
  useEffect(() => {
    hasLoadedOnceRef.current = hasLoadedOnce;
  }, [hasLoadedOnce]);

  const fetchMembers = useCallback(() => {
    // Only the very first load should show a loading state — every refetch
    // after that (add/edit/mark-paid/etc. via onUpdated) happens quietly in
    // the background so the whole dashboard doesn't flash back to a splash
    // screen every time an admin taps a button.
    if (!hasLoadedOnceRef.current) setLoading(true);
    api
      .get("/members")
      .then((response) => {
        setMembers(response.data);
        setLoading(false);
        setHasLoadedOnce(true);
      })
      .catch((err) => {
        setError("Failed to load members");
        setLoading(false);
        setHasLoadedOnce(true);
      });
  }, []);
   useEffect(() => {
    registerPushNotifications();
    listenForForegroundMessages();
  }, []);


   useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    registerPushNotifications();
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
  async function handleLogoutAll() {
    setIsLoggingOut(true);
    try {
      const deviceModel = await getClientDeviceModel();
      await logoutAll(deviceModel);
    } catch (err) {
      setIsLoggingOut(false);
    }
  }

  if (error) return <p className="p-8 text-red-400">{error}</p>;

  const counts = useMemo(
    () => ({
      active: members.filter((m) => m.status === "active").length,
      pending: members.filter((m) => m.status === "pending").length,
      inactive: members.filter(
        (m) => m.status === "inactive" || m.status === "not_renewing",
      ).length,
    }),
    [members],
  );

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
    { key: "inactive", label: "Inactive" },
    { key: "renewals", label: "Renewals" },
  ];

  const statusFiltered = useMemo(() => {
    return filter === "all"
      ? members
      : filter === "renewals"
        ? [...members]
            .filter(
              (m) =>
                !hideInactive ||
                (m.status !== "inactive" && m.status !== "not_renewing"),
            )
            .sort((a, b) => b.daysPastExpiry - a.daysPastExpiry)
        : filter === "inactive"
          ? members
              .filter(
                (m) => m.status === "inactive" || m.status === "not_renewing",
              )
              .sort((a, b) => a.daysPastExpiry - b.daysPastExpiry)
          : members.filter((m) => m.status === filter);
  }, [members, filter, hideInactive]);

  const searchTerm = search.trim().toLowerCase();

  const filteredMembers = useMemo(() => {
    return searchTerm
      ? statusFiltered.filter(
          (m) =>
            m.gymCode.toLowerCase().includes(searchTerm) ||
            fuzzyMatchesName(m.name, searchTerm),
        )
      : statusFiltered;
  }, [statusFiltered, searchTerm]);

  const statCards = [
    {
      label: "Active",
      value: counts.active,
      icon: Users,
      color: "#C6FF3D",
      filterKey: "active",
    },
    {
      label: "Pending",
      value: counts.pending,
      icon: Clock,
      color: "#F2C230",
      filterKey: "pending",
    },
    {
      label: "Inactive",
      value: counts.inactive,
      icon: XCircle,
      color: "#EF4444",
      filterKey: "inactive",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-[#F5F5F0]">
      {blockedNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-4">
          <div className="blocked-notice bg-[#F2C230] text-black text-sm font-bold px-4 py-3 rounded-lg shadow-lg text-center">
            {blockedNotice}
          </div>
        </div>
      )}
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
            <LogoutMenu
              onLogout={handleLogout}
              onLogoutAll={handleLogoutAll}
              isLoggingOut={isLoggingOut}
            />
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
                onClick={() => setFilter(isSelected ? "all" : filterKey)}
                style={{ borderColor: isSelected ? color : "#2A2A2A" }}
                className="text-left bg-[#1A1A1A] border-2 rounded-lg p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              >
                <Icon
                  style={{ color }}
                  className="w-5 h-5 md:w-8 md:h-8 shrink-0"
                  strokeWidth={2}
                />
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
          {showAddForm ? "Cancel" : "+ Add Member"}
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
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#999] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {filter === "renewals" && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-[#999] uppercase tracking-wide">
                Hide Inactive
              </span>
              <button
                type="button"
                onClick={() => setHideInactive(!hideInactive)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  hideInactive ? "bg-[#C6FF3D]" : "bg-[#333]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    hideInactive ? "translate-x-5" : "translate-x-0"
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
                <th className="border border-[#2A2A2A] px-4 py-3">
                  Start Date
                </th>
                <th className="border border-[#2A2A2A] px-4 py-3">End Date</th>
                <th className="border border-[#2A2A2A] px-4 py-3">Days Past</th>
                <th className="border border-[#2A2A2A] px-4 py-3">
                  Amount Paid
                </th>
                <th className="border border-[#2A2A2A] px-4 py-3">Actions</th>
              </tr>
            </thead>
            {loading && (
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            )}
            {!loading && filteredMembers.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan="9">
                    <EmptyState
                      icon={Users}
                      title="No members found"
                      message={
                        search
                          ? "Try a different search."
                          : "Add your first member to get started."
                      }
                    />
                  </td>
                </tr>
              </tbody>
            )}
            {!loading &&
              filteredMembers.length > 0 &&
              filteredMembers.map((member) => (
                <MemberRow
                  key={member._id}
                  member={member}
                  isOpen={activeMemberId === member._id}
                  onToggle={handleToggleMember}
                  onEditingChange={handleEditingChange}
                  onMarkPaidChange={handleMarkPaidChange}
                  shakeSignal={member._id === shakeMemberId ? shakeTick : 0}
                  onUpdated={fetchMembers}
                />
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
              message={
                search
                  ? "Try a different search."
                  : "Add your first member to get started."
              }
            />
          ) : (
            filteredMembers.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                isOpen={activeMemberId === member._id}
                onToggle={handleToggleMember}
                onEditingChange={handleEditingChange}
                onMarkPaidChange={handleMarkPaidChange}
                shakeSignal={member._id === shakeMemberId ? shakeTick : 0}
                onUpdated={fetchMembers}
              />
            ))
          )}
        </div>
      </div>

      {pendingSwitch && (
        <ConfirmDialog
          title="Unsaved Changes"
          message={`You're currently editing ${editingMember.name}. Switching now will discard those changes.`}
          confirmLabel="Discard & Switch"
          danger
          onConfirm={handleConfirmSwitch}
          onCancel={() => setPendingSwitch(null)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;