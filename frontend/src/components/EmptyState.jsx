function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-10 h-10 text-[#444] mb-3" />}
      <p className="font-bold text-[#999] uppercase tracking-wide text-sm mb-1">{title}</p>
      {message && <p className="text-[#666] text-sm">{message}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 bg-[#F2C230] text-black text-xs font-bold uppercase tracking-wide px-4 py-2 rounded hover:bg-[#C6FF3D] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;