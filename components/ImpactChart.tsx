type ImpactChartProps = {
  data: { day: string; kwh: number }[];
};

export function ImpactChart({ data }: ImpactChartProps) {
  const maxKwh = Math.max(...data.map((point) => point.kwh), 1);

  return (
    <div className="mt-4 flex h-40 items-end gap-2">
      {data.map((point) => (
        <div key={point.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <div
            className="w-full rounded-t-sm bg-amber-400"
            style={{ height: `${(point.kwh / maxKwh) * 100}%` }}
            title={`${point.kwh.toFixed(1)} kWh on ${point.day}`}
          />
          <span className="text-[10px] text-neutral-500">{point.day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
