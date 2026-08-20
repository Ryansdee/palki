'use client';

import { useEffect, useState } from 'react';
import ServiceCard from '@/components/ServiceCard';
import { getServices, DEFAULT_SERVICES } from '@/lib/data';
import type { Service } from '@/lib/types';

export default function SoinsPage() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);

  useEffect(() => {
    getServices().then((s) => s.length && setServices(s));
  }, []);

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Nos prestations</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Nos soins
        </h1>
        <p className="mt-5 leading-relaxed text-ink/65">
          [slug — introduction à la carte des soins, à compléter.]
        </p>
      </header>

      <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>
    </div>
  );
}
