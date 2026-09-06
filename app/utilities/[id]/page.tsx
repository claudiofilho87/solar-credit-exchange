import Link from "next/link";
import { notFound } from "next/navigation";
import utilities from "@/lib/data/utilities.json";
import ngos from "@/lib/data/ngos.json";
import { NgoCard } from "@/components/NgoCard";

type UtilityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UtilityPage({ params }: UtilityPageProps) {
  const { id } = await params;
  const utility = utilities.find((item) => item.id === id);

  if (!utility) {
    notFound();
  }

  const linkedNgos = ngos.filter((ngo) => ngo.utilityId === id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/states/${utility.stateCode}`} className="text-sm text-neutral-500 hover:underline">
        ← Back to {utility.stateCode}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{utility.name}</h1>
      <p className="text-neutral-500">NGOs receiving donated credits through this utility</p>

      <div className="mt-6 grid gap-3">
        {linkedNgos.map((ngo) => (
          <NgoCard key={ngo.id} id={ngo.id} name={ngo.name} city={ngo.city} demo={ngo.demo} />
        ))}
      </div>
    </div>
  );
}
