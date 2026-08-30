function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black text-[#F5F5F0]" aria-hidden="true">
      <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 gap-3">
          <div className="h-7 w-48 bg-[#1A1A1A] rounded" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-4 bg-[#1A1A1A] rounded" />
            <div className="h-4 w-4 bg-[#1A1A1A] rounded" />
            <div className="h-8 w-8 bg-[#1A1A1A] rounded" />
          </div>
        </div>

        {/* Search bar */}
        <div className="h-[52px] bg-[#1A1A1A] border-2 border-[#2A2A2A] rounded-lg mb-8" />

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-[#1A1A1A] border-2 border-[#2A2A2A] rounded-lg h-[70px] md:h-[88px]"
            />
          ))}
        </div>

        {/* Add member button */}
        <div className="h-10 w-32 bg-[#1A1A1A] rounded mb-4" />

        {/* Filter row */}
        <div className="h-9 w-28 bg-[#1A1A1A] rounded mt-8 mb-4" />

        {/* Member rows */}
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;