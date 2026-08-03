function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center gap-4">
      <img
        src="/images/logo.png"
        alt="Loading"
        className="w-16 h-16 animate-pulse"
      />
      <p className="text-[#999] text-sm uppercase tracking-wide">Loading...</p>
    </div>
  );
}

export default LoadingScreen;