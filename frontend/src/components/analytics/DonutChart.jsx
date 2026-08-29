import { useState } from 'react';

// Donut chart built from plain SVG circles using stroke-dasharray —
// no charting library, same dependency-light approach as BarChart.
//
// Interactivity is tap-based, not hover-based: hover doesn't exist on phones,
// so tapping a slice is what actually works as "interactive" on mobile.
// Tapping shows that slice's label/count/percent in the center; tapping the
// same slice again (or the center) returns to the total view.
function DonutChart({ data }) {
  const [selected, setSelected] = useState(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 70;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const activeSlice = selected !== null ? data[selected] : null;
  const centerLabel = activeSlice ? activeSlice.label : 'Total';
  const centerValue = activeSlice ? activeSlice.value : total;
  const centerPercent = activeSlice && total > 0 ? Math.round((activeSlice.value / total) * 100) : null;

  if (total === 0) {
    return <p className="text-sm text-[#666] text-center py-8">No member data yet.</p>;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
        <svg viewBox="0 0 180 180" className="-rotate-90" width="180" height="180">
          {data.map((d, i) => {
            if (d.value === 0) return null;
            const percent = d.value / total;
            const dashLength = percent * circumference;
            const dashOffset = -(cumulativePercent * circumference);
            cumulativePercent += percent;
            const isDimmed = selected !== null && selected !== i;

            return (
              <circle
                key={i}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={selected === i ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                opacity={isDimmed ? 0.3 : 1}
                style={{ transition: 'all 0.25s ease', cursor: 'pointer' }}
                onClick={() => setSelected(selected === i ? null : i)}
              />
            );
          })}
        </svg>
        {/* Center label — tapping it clears the selection back to Total */}
        <div
          onClick={() => setSelected(null)}
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
        >
          <span className="text-2xl font-black text-white">{centerValue}</span>
          <span className="text-[10px] text-[#999] uppercase tracking-wide">{centerLabel}</span>
          {centerPercent !== null && (
            <span className="text-[10px] font-bold" style={{ color: activeSlice.color }}>{centerPercent}%</span>
          )}
        </div>
      </div>

      {/* Legend doubles as tap targets — bigger hit area than the thin ring itself,
          which matters more on phones than desktop. */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        {data.map((d, i) => {
          const percent = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`flex items-center justify-between gap-4 px-2 py-1.5 rounded transition-colors ${
                selected === i ? 'bg-[#222]' : 'hover:bg-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2 text-sm text-white">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                {d.label}
              </span>
              <span className="text-xs text-[#999]">{d.value} · {percent}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DonutChart;