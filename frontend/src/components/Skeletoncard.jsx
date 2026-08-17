function SkeletonCard() {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-[#2A2A2A] rounded" />
          <div className="h-3 w-16 bg-[#2A2A2A] rounded" />
        </div>
        <div className="h-5 w-16 bg-[#2A2A2A] rounded" />
      </div>
      <div className="h-3 w-32 bg-[#2A2A2A] rounded mb-2" />
      <div className="h-3 w-24 bg-[#2A2A2A] rounded" />
    </div>
  );
}

export default SkeletonCard;