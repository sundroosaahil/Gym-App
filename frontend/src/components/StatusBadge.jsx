import { AlertTriangle } from 'lucide-react';

const styles = {
  active: 'bg-[#C6FF3D]/15 text-[#C6FF3D] border-[#C6FF3D]/40',
  pending: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  inactive: 'bg-red-500/15 text-red-400 border-red-500/40'
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status]}`}
    >
      {status === 'pending' && <AlertTriangle className="w-3 h-3" strokeWidth={3} />}
      {status}
    </span>
  );
}

export default StatusBadge;