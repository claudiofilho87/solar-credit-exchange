import Link from "next/link";

type UtilityCardProps = {
  id: string;
  name: string;
};

export function UtilityCard({ id, name }: UtilityCardProps) {
  return (
    <Link
      href={`/utilities/${id}`}
      className="block rounded-lg border border-neutral-200 p-4 transition hover:border-amber-400 hover:shadow-sm dark:border-neutral-800"
    >
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-neutral-500">View linked NGOs →</p>
    </Link>
  );
}
