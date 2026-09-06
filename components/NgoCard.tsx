import Link from "next/link";

type NgoCardProps = {
  id: string;
  name: string;
  city: string;
  demo: boolean;
};

export function NgoCard({ id, name, city, demo }: NgoCardProps) {
  return (
    <Link
      href={`/ngos/${id}`}
      className="block rounded-lg border border-neutral-200 p-4 transition hover:border-amber-400 hover:shadow-sm dark:border-neutral-800"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{name}</p>
        {demo && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
            Demo NGO
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-500">{city}</p>
    </Link>
  );
}
