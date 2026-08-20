import Link from 'next/link';
import type { Service } from '@/lib/types';

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/soins/${service.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-sand"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.nom}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="pointer-events-none absolute inset-3 border border-cloud/40" />
      </Link>

      <div className="flex flex-1 flex-col pt-6">
        <h3 className="font-display text-2xl text-ink">{service.nom}</h3>
        <p className="mt-2 flex-1 leading-relaxed text-ink/65">{service.resume}</p>
        <Link
          href={`/soins/${service.slug}`}
          className="link-underline mt-5"
        >
          Lire plus
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
