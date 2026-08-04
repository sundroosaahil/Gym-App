function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-black uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-[#999] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold uppercase text-[#999] hover:text-[#F5F5F0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${
              danger
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#F2C230] text-black hover:bg-[#C6FF3D]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;