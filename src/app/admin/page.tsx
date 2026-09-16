'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getReservations, seedDefaults } from '@/lib/data';
import { useTenant } from '@/lib/tenant-context';

const CARDS = [
  {
    href: '/admin/tarifs',
    title: 'Tarifs',
    desc: 'Modifier les prix, ajouter ou retirer des prestations.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 3.5h6l7 7-9.5 9.5-7-7v-6a3 3 0 0 1 3-3Z" />
        <circle cx="9" cy="9" r="1.25" />
      </svg>
    ),
  },
  {
    href: '/admin/promotions',
    title: 'Promotions',
    desc: 'Créer des réductions en % ou en €, activables en un clic.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 5 5 19" />
        <circle cx="7.5" cy="7.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
  },
  {
    href: '/admin/galeries',
    title: 'Photos galeries',
    desc: 'Ajouter ou supprimer les photos affichées sur le site.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m21 16-5-5L5 20" />
      </svg>
    ),
  },
  {
    href: '/admin/disponibilites',
    title: 'Disponibilités',
    desc: 'Définir vos horaires d’ouverture, jour par jour.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      </svg>
    ),
  },
  {
    href: '/admin/reservations',
    title: 'Réservations',
    desc: 'Consulter, confirmer ou annuler les demandes reçues.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v12H7l-3 3V4Z" />
        <path d="M8 9h8M8 12.5h5" />
      </svg>
    ),
  },
];

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  pro: 'Pro',
  business: 'Business',
};

const PLAN_STYLES: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600 ring-slate-200',
  pro: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  business: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function AdminDashboard() {
  const tenant = useTenant();
  const [enAttente, setEnAttente] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const canManageSetup = tenant.role === 'owner' || tenant.role === 'admin';

  useEffect(() => {
    getReservations(tenant.orgId).then((r) =>
      setEnAttente(r.filter((x) => x.statut === 'en_attente').length)
    );
  }, [tenant.orgId]);

  async function runSeed() {
    setSeeding(true);
    try {
      await seedDefaults(tenant.orgId);
      setSeeded(true);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-semibold text-white">
            {tenant.orgName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Espace d’administration
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{tenant.orgName}</h1>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${
            PLAN_STYLES[tenant.plan] ?? PLAN_STYLES.free
          }`}
        >
          {PLAN_LABELS[tenant.plan] ?? tenant.plan}
        </span>
      </div>

      {/* Stat row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/reservations"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Reservation en attente</p>
            {enAttente > 0 && (
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
            )}
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{enAttente}</p>
          <p className="mt-1 text-xs text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
            Voir les réservations →
          </p>
        </Link>
      </div>

      {/* Nav cards */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-slate-900">Gestion</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                <span className="h-5 w-5">{c.icon}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-indigo-600">
                {c.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Setup */}
      {canManageSetup && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-lg">
              <p className="text-sm font-semibold text-slate-900">Première installation</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Charge le contenu de départ (soins, tarifs, horaires, coordonnées)
                dans l’espace de {tenant.orgName}. À lancer une seule fois, au
                démarrage.
              </p>
            </div>
            <button
              onClick={runSeed}
              disabled={seeding || seeded}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {seeded
                ? 'Contenu initialisé ✓'
                : seeding
                  ? 'Initialisation…'
                  : 'Initialiser le contenu'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}