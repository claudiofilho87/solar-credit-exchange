import Link from "next/link";
import { notFound } from "next/navigation";
import states from "@/lib/data/states.json";
import utilities from "@/lib/data/utilities.json";
import { UtilityCard } from "@/components/UtilityCard";

type StatePageProps = {
  params: Promise<{ code: string }>;
};

export default async function StatePage({ params }: StatePageProps) {
  const { code } = await params;
  const stateCode = code.toUpperCase();
  const state = states.find((item) => item.code === stateCode);

  if (!state) {
    notFound();
  }

  const stateUtilities = utilities.filter((utility) => utility.stateCode === stateCode);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back to map
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{state.name}</h1>
      <p className="text-neutral-500">{state.region}</p>

      {stateUtilities.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500 dark:border-neutral-700">
          No demo utility registered for this state yet — this is a partial demo dataset.
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {stateUtilities.map((utility) => (
            <UtilityCard key={utility.id} id={utility.id} name={utility.name} />
          ))}
        </div>
      )}
    </div>
  );
}
