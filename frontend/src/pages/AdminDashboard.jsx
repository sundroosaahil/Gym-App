import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  XCircle,
  Search,
  FileText,
  BarChart3,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import api from "../api/axiosConfig";
import AddMemberForm from "../components/AddMemberForm";
import MemberRow from "../components/MemberRow";
import MemberCard from "../components/MemberCard";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonRow from "../components/SkeletonRow";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { fuzzyMatchesName, nameMatchRank } from "../utils/fuzzySearch";
import { getDisplayName } from "../utils/getDisplayName";
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
  // While the admin is actively searching (focused or has typed something),
  // the on-screen keyboard eats most of a phone screen — so we tuck the
  // stat cards and Add Member row out of the way and pull results right up
  // under the search bar instead of leaving them stranded below the fold.
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, logoutAll } = useAuth();
  const [hideInactive, setHideInactive] = useState(true);

  // Only one member's details/actions panel can be open at a time.
  const [activeMemberId, setActiveMemberId] = useState(null);

  // Edit and Mark Paid now open as full-screen modals (see MemberCard /
  // MemberRow), so they naturally block interaction with every other card
  // via their own backdrop — there's no longer a need to track "is some
  // other member mid-edit" up here, shake a busy card, or warn before
  // switching between members. Each modal handles its own "discard
  // changes?" confirmation internally instead.
  const handleToggleMember = useCallback((memberId) => {
    setActiveMemberId((current) => (current === memberId ? null : memberId));
  }, []);

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
  // Push registration + foreground listener only need to run once per
  // mount. This used to be split across two separate useEffects that both
  // called registerPushNotifications() — harmless on a fast connection, but
  // it meant every dashboard load fired two /auth/fcm-token requests
  // instead of one, and doubled up on whatever registerPushNotifications
  // does internally (permission prompt, token fetch, etc). Consolidated
  // into a single effect.
  useEffect(() => {
    registerPushNotifications();
    listenForForegroundMessages();
  }, []);

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
          : members
              .filter((m) => m.status === filter)
              .sort((a, b) => b.daysPastExpiry - a.daysPastExpiry);
  }, [members, filter, hideInactive]);

  const searchTerm = search.trim().toLowerCase();

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return statusFiltered;

    return statusFiltered
      .filter(
        (m) =>
          m.gymCode.toLowerCase().includes(searchTerm) ||
          fuzzyMatchesName(getDisplayName(m), searchTerm),
      )
      // Relevance sort: exact/prefix name matches float to the top instead
      // of staying wherever the status/renewal sort left them. A gym-code
      // match that isn't also a name match ranks just below a substring
      // name match, since code lookups tend to be intentional but shouldn't
      // outrank a name someone actually typed a name for.
      .map((m) => {
        const nameRank = nameMatchRank(getDisplayName(m), searchTerm);
        const codeRank = m.gymCode.toLowerCase().includes(searchTerm) ? 3 : 5;
        return { member: m, rank: Math.min(nameRank, codeRank) };
      })
      .sort((a, b) => a.rank - b.rank)
      .map(({ member }) => member);
  }, [statusFiltered, searchTerm]);

  // Same condition used to compact the layout while searching — focused
  // counts too, so things shift out of the way right as the keyboard opens
  // rather than waiting for the first keystroke.
  const isSearchActive = isSearchFocused || searchTerm.length > 0;

  function handleSearchFocus() {
    setIsSearchFocused(true);
    // Let the on-screen keyboard finish animating in, then make sure the
    // search bar ends up at the top of the visible area — otherwise on a
    // lot of phones it (and everything below it) stays half-hidden behind
    // the keyboard the whole time you're typing.
    setTimeout(() => {
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  function handleSearchBlur() {
    setIsSearchFocused(false);
  }

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
    <div className="min-h-screen bg-[#090909] text-[#F5F5F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-7 sm:mb-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#F2C230] mb-2">
              Operations overview
            </p>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[#777] mt-2">Manage members, renewals, and gym activity.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/admin/logs"
              className="flex min-h-10 items-center gap-2 rounded-lg border border-[#292929] px-3 text-xs sm:text-sm text-[#999] hover:border-[#F2C230] hover:text-[#F2C230] transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Logs</span>
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
        </header>

        <div className="sticky top-0 z-30 bg-[#090909]/95 backdrop-blur-sm pt-2 pb-4 mb-5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 md:static md:mx-0 md:px-0 md:pt-0 md:mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-full min-h-12 bg-[#151515] border border-[#303030] rounded-xl pl-12 pr-11 py-3.5 text-base placeholder-[#666] focus:outline-none focus:border-[#F2C230] focus:ring-1 focus:ring-[#F2C230]/40 transition-colors"
            />
            {search && (
              <button
                type="button"
                // onMouseDown (not onClick) fires before the input's onBlur,
                // so the field doesn't collapse out of "search active" mode
                // for a frame before the click actually registers.
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearch("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[#666] hover:text-[#F5F5F0] hover:bg-[#2A2A2A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Instant feedback that shows right under the search bar, so it's
              still visible even when the keyboard is covering everything
              below it — you don't have to dismiss the keyboard just to find
              out whether your search matched anything. */}
          {searchTerm && (
            <p className="text-xs text-[#999] mt-2 px-1">
              {filteredMembers.length} member{filteredMembers.length === 1 ? "" : "s"} found
            </p>
          )}
        </div>

        <div className={`grid grid-cols-3 gap-2 md:gap-4 mb-8 ${isSearchActive ? "hidden md:grid" : ""}`}>
          {statCards.map(({ label, value, icon: Icon, color, filterKey }) => {
            const isSelected = filter === filterKey;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setFilter(isSelected ? "all" : filterKey)}
                style={{ borderColor: isSelected ? color : "#2A2A2A" }}
                className="text-left bg-[#151515] border rounded-xl p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#191919]"
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

        <div className={`flex flex-col md:flex-row md:items-center gap-3 mb-5 ${isSearchActive ? "hidden md:flex" : ""}`}>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full md:flex-1 flex min-h-12 items-center justify-center gap-2 bg-[#F2C230] text-black font-black uppercase px-5 py-3.5 rounded-xl hover:bg-[#C6FF3D] hover:-translate-y-0.5 transition-all tracking-wide shadow-[0_8px_24px_rgba(242,194,48,0.12)]"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            Add Member
          </button>

          {/* The dropdown filter (defaults to "All") only shows up on
              tablet/desktop, next to Add Member — on phones the stat cards
              above are enough and the big Add Member button gets full width. */}
          <div className="hidden md:flex md:items-center gap-3">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-[#1A1A1A] text-[#F5F5F0] text-sm font-bold uppercase tracking-wide border border-[#333] rounded px-4 py-3.5 pr-9 cursor-pointer hover:border-[#555] transition-colors focus:outline-none focus:border-[#F2C230]"
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
              <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
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
        </div>

        {showAddForm && (
          <Modal onClose={() => setShowAddForm(false)}>
            <AddMemberForm
              onMemberAdded={() => {
                fetchMembers();
                setShowAddForm(false);
              }}
            />
          </Modal>
        )}

        {/* Desktop table */}
        <div className="hidden md:block bg-[#151515] border border-[#292929] rounded-2xl overflow-x-auto shadow-2xl shadow-black/20">
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
                <th className="border border-[#2A2A2A] px-4 py-3">Renewal / Days Past</th>
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
                      actionLabel={search ? "Clear search" : "Add Member"}
                      onAction={search ? () => setSearch("") : () => setShowAddForm(true)}
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
                  onUpdated={fetchMembers}
                />
              ))}
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
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
              actionLabel={search ? "Clear search" : "Add Member"}
              onAction={search ? () => setSearch("") : () => setShowAddForm(true)}
            />
          ) : (
            filteredMembers.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                isOpen={activeMemberId === member._id}
                onToggle={handleToggleMember}
                onUpdated={fetchMembers}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
