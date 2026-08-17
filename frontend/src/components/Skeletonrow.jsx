function SkeletonRow() {
  return (
    <tr className="border-t border-[#2A2A2A] animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-[#2A2A2A] rounded w-full max-w-[100px]" />
        </td>
      ))}
    </tr>
  );
}

export default SkeletonRow;