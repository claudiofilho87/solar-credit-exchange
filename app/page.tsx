import { BrazilMap } from "@/components/BrazilMap";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center gap-8 px-6 py-16 text-center">
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        This is a hackathon demo project. No real energy donation is processed.
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Community Solar Energy Bank
        </h1>
        <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
          Donate surplus solar energy credits directly to low-income families
          served by local NGOs. Pick a state to get started.
        </p>
      </div>

      <BrazilMap />
    </div>
  );
}
