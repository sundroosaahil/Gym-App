import { useEffect, useRef } from 'react';
import { useInView } from '../../hooks/useInView';

// Reusable bar chart — takes data as [{ label, value }, ...].
// No chart library: bars are just divs whose height is animated via CSS
// transition once the chart scrolls into view.
//
// Bars have a FIXED width (not flex-1 stretched to fill the container).
// With 12 months of data on a narrow phone screen, stretched bars got thin
// enough that the value label above each one started overlapping its
// neighbor. Fixed width + horizontal scroll means every bar always has
// enough room to breathe, at the cost of not seeing all months at once —
// an intentional trade, since a squished unreadable chart isn't better
// than a scrollable readable one.
//
// highlightLast: when true, the final bar (usually "current month") is drawn
// in a different color, AND the chart auto-scrolls to show it by default,
// so the person doesn't have to scroll to find "now."
function BarChart({ data, color = '#F2C230', highlightColor = '#C6FF3D', highlightLast = false, formatValue = (v) => v }) {
  const [inViewRef, isInView] = useInView({ threshold: 0.2 });
  const scrollRef = useRef(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const showScrollHint = data.length > 6;

  // On mount, jump the scroll position to the right edge so the most recent
  // bar (today/this month) is visible without the person having to scroll.
  useEffect(() => {
    if (scrollRef.current && highlightLast) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [highlightLast, data.length]);

  return (
    <div>
      <div
        ref={scrollRef}
        className="overflow-x-auto -mx-1 px-1 scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div ref={inViewRef} className="flex items-end gap-1.5 h-48 w-max">
          {data.map((d, i) => {
            const heightPercent = (d.value / max) * 100;
            const isLast = highlightLast && i === data.length - 1;
            const barColor = isLast ? highlightColor : color;

            return (
              <div key={i} className="group flex flex-col items-center gap-1.5 h-full justify-end w-11 sm:w-16 shrink-0">
                <span
                  className={`text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
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
      </div>
      {showScrollHint && (
        <p className="sm:hidden text-[10px] text-[#555] text-center mt-2">← swipe to see more →</p>
      )}
    </div>
  );
}

export default BarChart;
//check