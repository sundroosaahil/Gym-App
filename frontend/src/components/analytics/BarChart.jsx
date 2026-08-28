import { useInView } from '../../hooks/useInView';

// Reusable bar chart — takes data as [{ label, value }, ...].
// No chart library: bars are just divs whose height is animated via CSS
// transition once the chart scrolls into view. Good enough for small,
// simple datasets like ours without adding a dependency.
//
// highlightLast: when true, the final bar (usually "current month") is drawn
// in lime instead of the base color, so the eye finds "now" immediately
// instead of having to read every label.
function BarChart({ data, color = '#F2C230', highlightColor = '#C6FF3D', highlightLast = false, formatValue = (v) => v }) {
  const [ref, isInView] = useInView({ threshold: 0.2 });
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div ref={ref} className="flex items-end gap-1.5 sm:gap-2 h-48 px-1">
      {data.map((d, i) => {
        const heightPercent = (d.value / max) * 100;
        const isLast = highlightLast && i === data.length - 1;
        const barColor = isLast ? highlightColor : color;

        return (
          <div key={i} className="group flex-1 flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
            <span
              className={`text-[10px] sm:text-xs font-bold transition-colors ${
                isLast ? 'text-[#C6FF3D]' : 'text-[#999] group-hover:text-[#F2C230]'
              }`}
            >
              {d.value > 0 ? formatValue(d.value) : ''}
            </span>
            <div className="w-full h-full flex items-end">
              <div
                style={{
                  height: isInView ? `${heightPercent}%` : '0%',
                  backgroundColor: barColor,
                  transitionDelay: `${i * 40}ms`,
                  boxShadow: isLast ? `0 0 12px ${highlightColor}66` : 'none'
                }}
                className="w-full rounded-t transition-all duration-700 ease-out min-h-[2px] group-hover:brightness-110"
              />
            </div>
            <span className={`text-[9px] sm:text-[10px] uppercase tracking-wide ${isLast ? 'text-[#C6FF3D] font-bold' : 'text-[#666]'}`}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;