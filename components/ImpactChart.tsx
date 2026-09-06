type ImpactChartProps = {
  data: { day: string; kwh: number }[];
};

// Leaves headroom above the tallest bar so it doesn't touch the top edge.
const MAX_BAR_HEIGHT_PERCENT = 90;

export function ImpactChart({ data }: ImpactChartProps) {
  const maxKwh = Math.max(...data.map((point) => point.kwh), 1);

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex h-40 items-end justify-center gap-3 border-b border-neutral-200 px-2 dark:border-neutral-800">
        {data.map((point) => (
          <div
            key={point.day}
            className="flex h-full w-10 flex-shrink-0 flex-col items-center justify-end"
          >
            <div
              className="w-full max-w-6 rounded-t-sm bg-amber-400"
              style={{ height: `${(point.kwh / maxKwh) * MAX_BAR_HEIGHT_PERCENT}%` }}
              title={`${point.kwh.toFixed(1)} kWh on ${point.day}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-center gap-3 px-2">
        {data.map((point) => (
          <span key={point.day} className="w-10 flex-shrink-0 text-center text-[10px] text-neutral-500">
            {point.day.slice(5)}
          </span>
        ))}
      </div>
    </div>
  );
}
