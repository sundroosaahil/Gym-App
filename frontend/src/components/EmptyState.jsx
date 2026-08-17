function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-10 h-10 text-[#444] mb-3" />}
      <p className="font-bold text-[#999] uppercase tracking-wide text-sm mb-1">{title}</p>
      {message && <p className="text-[#666] text-sm">{message}</p>}
    </div>
  );
}

export default EmptyState;