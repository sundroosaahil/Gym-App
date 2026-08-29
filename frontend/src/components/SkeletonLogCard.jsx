function SkeletonLogCard() {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-2 w-full max-w-[220px]">
          <div className="h-3 w-24 bg-[#2A2A2A] rounded" />
          <div className="h-3 w-full bg-[#2A2A2A] rounded" />
          <div className="h-3 w-20 bg-[#2A2A2A] rounded" />
        </div>
        <div className="h-3 w-16 bg-[#2A2A2A] rounded shrink-0" />
      </div>
    </div>
  );
}

export default SkeletonLogCard;