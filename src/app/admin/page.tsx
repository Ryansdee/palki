'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getReservations, seedDefaults } from '@/lib/data';

const CARDS = [
  {
    href: '/admin/tarifs',
    title: 'Tarifs',
    desc: 'Modifier les prix, ajouter ou retirer des prestations.',
  },
  {
    href: '/admin/promotions',
    title: 'Promotions',
    desc: 'Créer des réductions en % ou en €, activables en un clic.',
  },
  {
    href: '/admin/galeries',
    title: 'Photos galeries',
    desc: 'Ajouter ou supprimer les photos affichées sur le site.',
  },
  {
    href: '/admin/disponibilites',
    title: 'Disponibilités',
    desc: 'Définir vos horaires d’ouverture, jour par jour.',
  },
  {
    href: '/admin/reservations',
    title: 'Réservations',
    desc: 'Consulter, confirmer ou annuler les demandes reçues.',
  },
];

export default function AdminDashboard() {
  const [enAttente, setEnAttente] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    getReservations().then((r) =>
      setEnAttente(r.filter((x) => x.statut === 'en_attente').length)
    );
  }, []);

  async function runSeed() {
    setSeeding(true);
    try {
      await seedDefaults();
      setSeeded(true);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Tableau de bord</h1>

      {enAttente > 0 && (
        <Link
          href="/admin/reservations"
          className="mt-6 inline-block border border-mauve/40 bg-cloud px-5 py-3 text-sm text-ink transition-colors hover:border-plum"
        >
          {enAttente} demande{enAttente > 1 ? 's' : ''} en attente →
        </Link>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="frame group bg-cloud px-7 py-8 transition-colors hover:bg-porcelain"
          >
            <h2 className="font-display text-2xl text-ink group-hover:text-plum">
              {c.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow">Première installation</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/60">
          Charge le contenu de départ (soins, tarifs, horaires, coordonnées)
          dans la base. À lancer une seule fois, au démarrage.
        </p>
        <button
          onClick={runSeed}
          disabled={seeding || seeded}
          className="btn-outline mt-4 disabled:opacity-50"
        >
          {seeded
            ? 'Contenu initialisé ✓'
            : seeding
              ? 'Initialisation…'
              : 'Initialiser le contenu'}
        </button>
      </div>
    </div>
  );
}