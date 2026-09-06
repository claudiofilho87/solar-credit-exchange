import Link from "next/link";
import { prisma } from "@/lib/db";
import ngos from "@/lib/data/ngos.json";
import { ImpactChart } from "@/components/ImpactChart";

// The aggregates below always reflect the latest donations, not a stale build-time snapshot.
export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}

export default async function ImpactPage() {
  const [totalStats, donationCount, ngoGroups, donations] = await Promise.all([
    prisma.donation.aggregate({ _sum: { creditsKwh: true } }),
    prisma.donation.count(),
    prisma.donation.groupBy({ by: ["ngoId"] }),
    prisma.donation.findMany({
      orderBy: { createdAt: "asc" },
      select: { creditsKwh: true, createdAt: true, ngoName: true },
    }),
  ]);

  if (donationCount === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">No donations yet</h1>
        <p className="text-neutral-500">Be the first to donate solar credits to a family in need.</p>
        <Link
          href="/"
          className="rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-amber-950 transition hover:bg-amber-300"
        >
          Go to the map
        </Link>
      </div>
    );
  }

  const totalKwh = totalStats._sum.creditsKwh ?? 0;
  const benefitedNgoIds = new Set(ngoGroups.map((group) => group.ngoId));
  const estimatedFamilies = ngos
    .filter((ngo) => benefitedNgoIds.has(ngo.id))
    .reduce((sum, ngo) => sum + ngo.familiesServed, 0);

  const dailyByNgo = new Map<string, Map<string, number>>();
  for (const donation of donations) {
    const day = donation.createdAt.toISOString().slice(0, 10);
    const byNgo = dailyByNgo.get(day) ?? new Map<string, number>();
    byNgo.set(donation.ngoName, (byNgo.get(donation.ngoName) ?? 0) + donation.creditsKwh);
    dailyByNgo.set(day, byNgo);
  }
  const chartData = Array.from(dailyByNgo.entries()).map(([day, byNgo]) => {
    const segments = Array.from(byNgo.entries())
      .map(([ngoName, kwh]) => ({ ngoName, kwh }))
      .sort((a, b) => a.ngoName.localeCompare(b.ngoName));
    return { day, segments };
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back to map
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Community Impact</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total credits donated" value={`${totalKwh.toFixed(1)} kWh`} />
        <StatCard label="Donations made" value={String(donationCount)} />
        <StatCard label="NGOs benefited" value={String(benefitedNgoIds.size)} />
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        ≈ {estimatedFamilies} families served across benefited NGOs (demo estimate, from registered NGO data)
      </p>

      <h2 className="mt-10 text-lg font-semibold">Donations over time</h2>
      <ImpactChart data={chartData} />
    </div>
  );
}
