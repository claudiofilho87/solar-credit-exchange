import Link from "next/link";
import { notFound } from "next/navigation";
import ngos from "@/lib/data/ngos.json";
import utilities from "@/lib/data/utilities.json";
import { DonateButton } from "@/components/DonateButton";

type NgoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NgoPage({ params }: NgoPageProps) {
  const { id } = await params;
  const ngo = ngos.find((item) => item.id === id);

  if (!ngo) {
    notFound();
  }

  const utility = utilities.find((item) => item.id === ngo.utilityId);

  if (!utility) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/utilities/${utility.id}`} className="text-sm text-neutral-500 hover:underline">
        ← Back to {utility.name}
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-2xl font-bold">{ngo.name}</h1>
        {ngo.demo && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
            Demo NGO
          </span>
        )}
      </div>
      <p className="text-neutral-500">{ngo.city}</p>
      <p className="mt-4 text-neutral-700 dark:text-neutral-300">{ngo.description}</p>
      <p className="mt-2 text-sm text-neutral-500">~{ngo.familiesServed} families served (demo estimate)</p>

      <DonateButton
        stateCode={utility.stateCode}
        utilityId={utility.id}
        ngoId={ngo.id}
        ngoName={ngo.name}
      />
    </div>
  );
}
