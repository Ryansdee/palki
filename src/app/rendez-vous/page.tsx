'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getServices,
  getTarifs,
  getHoraires,
  getOccupationForDate,
  getPromotions,
  promoPourService,
  prixApresPromo,
  formatEuro,
  creneauxDisponibles,
  createReservation,
  JOURS,
  DEFAULT_SERVICES,
} from '@/lib/data';
import type { Service, Tarif, HoraireJour, Promotion } from '@/lib/types';

function jourFromDate(dateStr: string): string {
  // getDay(): 0 = dimanche … 6 = samedi
  const idx = new Date(dateStr + 'T00:00:00').getDay();
  return JOURS[(idx + 6) % 7]; // décale pour que lundi = 0
}

function Booking() {
  const searchParams = useSearchParams();

  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [horaires, setHoraires] = useState<HoraireJour[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);

  const [serviceSlug, setServiceSlug] = useState('');
  const [tarifId, setTarifId] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [client, setClient] = useState({ nom: '', email: '', tel: '', note: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getServices().then((s) => s.length && setServices(s));
    getTarifs().then(setTarifs);
    getHoraires().then(setHoraires);
    getPromotions().then(setPromos);
  }, []);

  useEffect(() => {
    const s = searchParams.get('service');
    if (s) setServiceSlug(s);
  }, [searchParams]);

  const tarifsService = useMemo(
    () => tarifs.filter((t) => t.serviceSlug === serviceSlug),
    [tarifs, serviceSlug]
  );
  const tarif = tarifsService.find((t) => t.id === tarifId) ?? null;
  const promo = promoPourService(serviceSlug, promos);

  const today = new Date().toISOString().slice(0, 10);

  // Recalcule les créneaux quand la prestation ou la date changent
  useEffect(() => {
    setHeure('');
    if (!tarif || !date || horaires.length === 0) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    const jour = jourFromDate(date);
    const horaire =
      horaires.find((h) => h.jour === jour) ?? {
        jour,
        ferme: true,
        creneaux: [],
      };
    getOccupationForDate(date).then((occ) => {
      setSlots(creneauxDisponibles(horaire, tarif.dureeMin, occ));
      setLoadingSlots(false);
    });
  }, [tarif, date, horaires]);

  async function submit() {
    if (!tarif || !serviceSlug || !date || !heure) return;
    if (!client.nom || !client.email || !client.tel) {
      setError('Merci de renseigner votre nom, email et téléphone.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await createReservation({
        serviceSlug,
        prestation: tarif.nom,
        date,
        heure,
        dureeMin: tarif.dureeMin,
        client: { nom: client.nom, email: client.email, tel: client.tel },
        note: client.note,
        statut: 'en_attente',
        createdAt: Date.now(),
      });
      setDone(true);
    } catch {
      setError("La réservation n'a pas pu être envoyée. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <div className="frame inline-block px-10 py-8">
          <h1 className="font-display text-4xl text-ink">Demande envoyée</h1>
        </div>
        <p className="mt-8 leading-relaxed text-ink/70">
          Merci {client.nom}. Votre demande pour «&nbsp;{tarif?.nom}&nbsp;» le{' '}
          {date} à {heure} a bien été enregistrée. Elle sera confirmée par
          l&apos;institut.
        </p>
      </div>
    );
  }

  const field =
    'mt-2 w-full border border-sand bg-cloud px-4 py-3 text-ink outline-none transition-colors focus:border-plum';

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <header className="text-center">
        <p className="eyebrow">Sur rendez-vous</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Prendre rendez-vous
        </h1>
      </header>

      <div className="mt-14 space-y-10">
        {/* 1. Service */}
        <div>
          <label className="eyebrow">1 · Le soin</label>
          <select
            value={serviceSlug}
            onChange={(e) => {
              setServiceSlug(e.target.value);
              setTarifId('');
            }}
            className={field}
          >
            <option value="">Choisir un soin…</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Prestation */}
        {serviceSlug && (
          <div>
            <label className="eyebrow">2 · La prestation</label>
            <div className="mt-3 space-y-2">
              {tarifsService.map((t) => {
                const prixFinal = prixApresPromo(t.prix, promo);
                const remise = prixFinal < t.prix;
                const active = t.id === tarifId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTarifId(t.id)}
                    className={`flex w-full items-center justify-between border px-5 py-4 text-left transition-colors ${
                      active
                        ? 'border-plum bg-cloud'
                        : 'border-sand hover:border-mauve'
                    }`}
                  >
                    <span>
                      <span className="text-ink">{t.nom}</span>
                      <span className="ml-3 text-sm text-ink/45">
                        {t.dureeMin} min
                      </span>
                    </span>
                    <span className="font-display text-lg">
                      {remise && (
                        <span className="mr-2 text-ink/40 line-through">
                          {formatEuro(t.prix)}
                        </span>
                      )}
                      <span className={remise ? 'text-plum' : 'text-ink'}>
                        {formatEuro(prixFinal)}
                      </span>
                    </span>
                  </button>
                );
              })}
              {tarifsService.length === 0 && (
                <p className="text-ink/55">
                  Aucune prestation configurée pour ce soin.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. Date */}
        {tarif && (
          <div>
            <label className="eyebrow">3 · La date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={field}
            />
          </div>
        )}

        {/* 4. Créneau */}
        {tarif && date && (
          <div>
            <label className="eyebrow">4 · L&apos;horaire</label>
            {loadingSlots ? (
              <p className="mt-3 text-ink/55">Recherche des disponibilités…</p>
            ) : slots.length === 0 ? (
              <p className="mt-3 text-ink/55">
                Aucun créneau disponible ce jour-là. Essayez une autre date.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setHeure(s)}
                    className={`border px-4 py-2 text-sm transition-colors ${
                      heure === s
                        ? 'border-plum bg-plum text-cloud'
                        : 'border-sand text-ink hover:border-mauve'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Coordonnées */}
        {heure && (
          <div>
            <label className="eyebrow">5 · Vos coordonnées</label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Nom et prénom"
                value={client.nom}
                onChange={(e) => setClient({ ...client, nom: e.target.value })}
                className={field.replace('mt-2 ', '')}
              />
              <input
                placeholder="Téléphone"
                value={client.tel}
                onChange={(e) => setClient({ ...client, tel: e.target.value })}
                className={field.replace('mt-2 ', '')}
              />
              <input
                placeholder="Email"
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                className={`${field.replace('mt-2 ', '')} sm:col-span-2`}
              />
              <textarea
                placeholder="Remarque (optionnel)"
                value={client.note}
                onChange={(e) => setClient({ ...client, note: e.target.value })}
                rows={3}
                className={`${field.replace('mt-2 ', '')} sm:col-span-2`}
              />
            </div>

            {error && <p className="mt-4 text-sm text-rose">{error}</p>}

            <button
              onClick={submit}
              disabled={sending}
              className="btn-solid mt-6 w-full disabled:opacity-50"
            >
              {sending ? 'Envoi…' : 'Confirmer la demande'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RendezVousPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-32" />}>
      <Booking />
    </Suspense>
  );
}
