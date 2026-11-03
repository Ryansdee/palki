'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getServices,
  getTarifs,
  getSettings,
  getHoraireForDate,
  getOccupationForDate,
  getPromotions,
  promoPourService,
  prixApresPromo,
  formatEuro,
  creneauxDisponibles,
  creneauxDepuisListe,
  getJourCreneaux,
  formatHeure,
  createReservation,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
} from '@/lib/data';
import type { Service, Tarif, Promotion, Settings } from '@/lib/types';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

// Date locale "YYYY-MM-DD" (évite le décalage UTC de toISOString le soir).
const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

// Numéro au format wa.me : ne garde que les chiffres (retire espaces, +, etc.).
const toWhatsAppNumber = (tel: string): string => tel.replace(/\D/g, '');

function Booking() {
  const searchParams = useSearchParams();

  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

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
    getServices(ORG_ID).then((s) => s.length && setServices(s));
    getTarifs(ORG_ID).then(setTarifs);
    getPromotions(ORG_ID).then(setPromos);
    getSettings(ORG_ID).then(setSettings);
  }, []);

  // Heure demandée depuis la page d'accueil (?date=…&heure=…), sélectionnée
  // automatiquement dès qu'elle est disponible pour la prestation choisie.
  const [heureVoulue, setHeureVoulue] = useState('');

  useEffect(() => {
    const s = searchParams.get('service');
    if (s) setServiceSlug(s);
    const d = searchParams.get('date');
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setDate(d);
    const h = searchParams.get('heure');
    if (h && /^\d{2}:\d{2}$/.test(h)) setHeureVoulue(h);
  }, [searchParams]);

  const tarifsService = useMemo(
    () => tarifs.filter((t) => t.serviceSlug === serviceSlug),
    [tarifs, serviceSlug]
  );
  const tarif = tarifsService.find((t) => t.id === tarifId) ?? null;
  const promo = promoPourService(serviceSlug, promos);

  const today = isoLocal(new Date());

  // Recalcule les créneaux quand la prestation ou la date changent
  useEffect(() => {
    setHeure('');
    if (!tarif || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    Promise.all([
      getJourCreneaux(ORG_ID, date),
      getHoraireForDate(ORG_ID, date),
      getOccupationForDate(ORG_ID, date),
    ]).then(([jour, horaire, occ]) => {
      // Créneaux publiés pour cette date → prioritaires sur les plages horaires.
      const dispo = jour
        ? creneauxDepuisListe(jour, tarif.dureeMin, occ)
        : creneauxDisponibles(horaire, tarif.dureeMin, occ);
      setSlots(dispo);
      if (heureVoulue && dispo.includes(heureVoulue)) {
        setHeure(heureVoulue);
        setHeureVoulue('');
      }
      setLoadingSlots(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarif, date]);

  // Message WhatsApp récapitulant la demande de rendez-vous.
  function buildWhatsAppUrl(): string {
    const prixFinal = tarif ? prixApresPromo(tarif.prix, promo) : 0;
    const lignes = [
      'Bonjour 👋',
      'Je vous contacte depuis votre site internet pour une demande de rendez-vous.',
      '',
      `• Soin : ${tarif?.nom ?? ''}`,
      `• Date : ${date} à ${heure}`,
      `• Durée : ${tarif?.dureeMin ?? ''} min`,
      `• Tarif : ${formatEuro(prixFinal)}`,
      '',
      `Nom : ${client.nom}`,
      `Téléphone : ${client.tel}`,
      `Email : ${client.email}`,
    ];
    if (client.note) lignes.push(`Remarque : ${client.note}`);
    const numero = toWhatsAppNumber(settings.telephone);
    return `https://wa.me/${numero}?text=${encodeURIComponent(
      lignes.join('\n')
    )}`;
  }

  async function submit() {
    if (!tarif || !serviceSlug || !date || !heure) return;
    if (!client.nom || !client.email || !client.tel) {
      setError('Merci de renseigner votre nom, email et téléphone.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await createReservation(ORG_ID, {
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
      // Ouvre WhatsApp avec la demande préremplie, puis affiche la confirmation.
      window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
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
        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 bg-plum px-6 py-3 font-sans text-sm uppercase tracking-[0.15em] text-cloud transition-colors hover:bg-ink"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.887 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Renvoyer sur WhatsApp
        </a>
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
        {heureVoulue && date && (
          <p className="mx-auto mt-6 inline-block border border-sand bg-cloud px-5 py-2 text-sm text-ink/70">
            Créneau souhaité : le {date.split('-').reverse().join('/')} à{' '}
            {formatHeure(heureVoulue)} — choisissez votre soin.
          </p>
        )}
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
                    {formatHeure(s)}
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
              {sending ? 'Envoi…' : 'Confirmer et envoyer sur WhatsApp'}
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