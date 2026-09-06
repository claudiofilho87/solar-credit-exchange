"use client";

import { useRouter } from "next/navigation";
import states from "@/lib/data/states.json";
import utilities from "@/lib/data/utilities.json";

// Approximate relative position of each state in a grid cartogram.
// Not geographically precise — just close enough to read as "the shape of Brazil".
const GRID_POSITION: Record<string, { col: number; row: number }> = {
  RR: { col: 2, row: 0 },
  AP: { col: 4, row: 0 },
  AM: { col: 1, row: 1 },
  PA: { col: 3, row: 1 },
  AC: { col: 0, row: 2 },
  MA: { col: 4, row: 2 },
  CE: { col: 5, row: 2 },
  RN: { col: 6, row: 2 },
  RO: { col: 1, row: 3 },
  TO: { col: 2, row: 3 },
  PI: { col: 3, row: 3 },
  PB: { col: 5, row: 3 },
  PE: { col: 6, row: 3 },
  MT: { col: 1, row: 4 },
  BA: { col: 3, row: 4 },
  AL: { col: 5, row: 4 },
  MS: { col: 1, row: 5 },
  GO: { col: 2, row: 5 },
  MG: { col: 3, row: 5 },
  ES: { col: 4, row: 5 },
  SE: { col: 5, row: 5 },
  DF: { col: 2, row: 6 },
  SP: { col: 3, row: 6 },
  RJ: { col: 4, row: 6 },
  PR: { col: 1, row: 7 },
  SC: { col: 1, row: 8 },
  RS: { col: 1, row: 9 },
};

const COLUMNS = 7;
const ROWS = 10;

export function BrazilMap() {
  const router = useRouter();
  const statesWithUtility = new Set(utilities.map((utility) => utility.stateCode));

  return (
    <div className="inline-block">
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        {states.map((state) => {
          const position = GRID_POSITION[state.code];
          const hasCoverage = statesWithUtility.has(state.code);

          return (
            <button
              key={state.code}
              type="button"
              onClick={() => router.push(`/states/${state.code}`)}
              title={hasCoverage ? state.name : `${state.name} (no demo utility yet)`}
              style={{ gridColumn: position.col + 1, gridRow: position.row + 1 }}
              className={[
                "flex h-10 w-10 items-center justify-center rounded-md text-xs font-bold transition sm:h-12 sm:w-12 sm:text-sm",
                hasCoverage
                  ? "bg-amber-400 text-amber-950 hover:scale-110 hover:bg-amber-300"
                  : "bg-neutral-200 text-neutral-400 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-600 dark:hover:bg-neutral-700",
              ].join(" ")}
            >
              {state.code}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-amber-400" />
          Demo utility available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
          No demo utility yet
        </span>
      </div>
    </div>
  );
}
