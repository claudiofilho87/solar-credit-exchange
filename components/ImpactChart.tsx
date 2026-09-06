type ChartSegment = {
  ngoName: string;
  kwh: number;
};

type ChartPoint = {
  day: string;
  segments: ChartSegment[];
};

type ImpactChartProps = {
  data: ChartPoint[];
};

// Cycled by NGO name so the same NGO keeps the same color across bars.
const SEGMENT_COLORS = [
  "bg-amber-400",
  "bg-teal-400",
  "bg-indigo-400",
  "bg-rose-400",
  "bg-lime-400",
  "bg-sky-400",
  "bg-fuchsia-400",
  "bg-orange-400",
];

// Leaves headroom above the tallest bar so it doesn't touch the top edge.
const MAX_BAR_HEIGHT_PERCENT = 90;

export function ImpactChart({ data }: ImpactChartProps) {
  const dayTotals = data.map((point) => ({
    day: point.day,
    total: point.segments.reduce((sum, segment) => sum + segment.kwh, 0),
  }));
  const maxTotal = Math.max(...dayTotals.map((point) => point.total), 1);

  const ngoNames = Array.from(new Set(data.flatMap((point) => point.segments.map((s) => s.ngoName)))).sort();
  const colorForNgo = (ngoName: string) => SEGMENT_COLORS[ngoNames.indexOf(ngoName) % SEGMENT_COLORS.length];

  return (
    <div className="mt-4">
      <div className="flex h-40 items-end gap-3 border-b border-neutral-200 px-2 dark:border-neutral-800">
        {data.map((point) => {
          const total = point.segments.reduce((sum, segment) => sum + segment.kwh, 0);
          return (
            <div
              key={point.day}
              className="flex flex-1 flex-col-reverse items-center"
              style={{ height: `${(total / maxTotal) * MAX_BAR_HEIGHT_PERCENT}%` }}
            >
              {point.segments.map((segment, index) => (
                <div
                  key={segment.ngoName}
                  className="group/segment relative w-full max-w-6"
                  style={{ height: `${(segment.kwh / total) * 100}%` }}
                >
                  <div
                    className={`h-full w-full ${colorForNgo(segment.ngoName)} ${
                      index === point.segments.length - 1 ? "rounded-t-sm" : ""
                    }`}
                  />
                  <div className="pointer-events-none absolute -top-1 left-1/2 z-10 w-max -translate-x-1/2 -translate-y-full rounded-md bg-neutral-900 px-2 py-1 text-center text-[10px] leading-tight text-white opacity-0 shadow transition-opacity group-hover/segment:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
                    <div className="font-semibold">
                      {segment.ngoName}: {segment.kwh.toFixed(1)} kWh
                    </div>
                    <div className="text-neutral-300 dark:text-neutral-600">
                      {point.day} total: {total.toFixed(1)} kWh
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex gap-3 px-2">
        {data.map((point) => (
          <span key={point.day} className="flex-1 text-center text-[10px] text-neutral-500">
            {point.day.slice(5)}
          </span>
        ))}
      </div>

      {ngoNames.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-neutral-500">
          {ngoNames.map((ngoName) => (
            <span key={ngoName} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${colorForNgo(ngoName)}`} />
              {ngoName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
