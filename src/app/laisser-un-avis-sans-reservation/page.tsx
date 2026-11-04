'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getServices, envoyerAvisLibre } from '@/lib/data';
import type { Service } from '@/lib/types';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

const PATH =
  'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z';

const LIBELLES = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];

// Anti-spam léger : 1 avis / 24 h par navigateur + délai minimum + champ piège.
const CLE_COOLDOWN = 'palki_avis_libre_at';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DELAI_MIN_MS = 4000;

function dernierEnvoi(): number {
  try {
    return Number(localStorage.getItem(CLE_COOLDOWN) ?? 0);
  } catch {
    return 0;
  }
}

function marquerEnvoi() {
  try {
    localStorage.setItem(CLE_COOLDOWN, String(Date.now()));
  } catch {
    /* stockage indisponible : on ignore */
  }
}

export default function LaisserUnAvisSansReservation() {
  const [services, setServices] = useState<Service[]>([]);
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [prenom, setPrenom] = useState('');
  const [serviceSlug, setServiceSlug] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [consent, setConsent] = useState(false);
  const [piege, setPiege] = useState(''); // honeypot : doit rester vide
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');
  const ouvertA = useRef(Date.now());

  useEffect(() => {
    getServices(ORG_ID).then((l) => setServices(l.filter((s) => s.actif)));
  }, []);

  async function envoyer() {
    if (!note) return setErreur('Choisissez une note de 1 à 5 étoiles.');
    if (prenom.trim().length < 2) return setErreur('Indiquez votre prénom.');
    if (!serviceSlug) return setErreur('Choisissez le soin reçu.');
    if (commentaire.trim().length < 10) return setErreur('Ajoutez quelques mots sur votre expérience.');
    if (!consent) return setErreur('Merci de confirmer que vous êtes venue à l’institut.');
    if (Date.now() - dernierEnvoi() < COOLDOWN_MS)
      return setErreur('Vous avez déjà laissé un avis récemment. Merci !');

    // Bot probable : on simule un succès sans rien enregistrer.
    if (piege || Date.now() - ouvertA.current < DELAI_MIN_MS) {
      setEnvoye(true);
      return;
    }

    const autre = serviceSlug === 'autre';
    const service = services.find((s) => s.slug === serviceSlug);

    setErreur('');
    setEnvoi(true);
    try {
      await envoyerAvisLibre(ORG_ID, {
        prenom,
        prestation: autre ? 'Autre soin' : service?.nom ?? serviceSlug,
        serviceSlug: autre ? 'autre' : serviceSlug,
        note,
        commentaire,
      });
      marquerEnvoi();
      setEnvoye(true);
    } catch {
      setErreur('Une erreur est survenue. Réessayez dans un instant.');
    } finally {
      setEnvoi(false);
    }
  }

  if (envoye) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <div className="frame inline-block px-10 py-8">
          <h1 className="font-display text-4xl text-ink">Merci{prenom.trim() ? ` ${prenom.trim()}` : ''} !</h1>
        </div>
        <p className="mt-8 leading-relaxed text-ink/70">
          Votre avis a bien été reçu. Il apparaîtra sur le site après une rapide
          vérification par l&apos;institut.
        </p>
        <Link href="/avis" className="btn-outline mt-8">Voir les avis</Link>
      </div>
    );
  }

  const affichee = survol || note;
  const field =
    'mt-2 w-full border border-sand bg-cloud px-4 py-3 text-ink outline-none transition-colors focus:border-plum';

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <header className="text-center">
        <p className="eyebrow">Votre avis compte</p>
        <h1 className="mt-4 font-display text-5xl text-ink">Laisser un avis</h1>
        <p className="mt-5 leading-relaxed text-ink/70">
          Vous êtes venue chez Palki sans réserver en ligne&nbsp;? Racontez-nous
          comment s&apos;est passé votre soin.
        </p>
      </header>

      <div className="mt-12 space-y-10">
        <div className="text-center">
          <div className="inline-flex gap-1" onMouseLeave={() => setSurvol(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNote(n)}
                onMouseEnter={() => setSurvol(n)}
                aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                className="p-1 transition-transform hover:scale-110"
              >
                <svg viewBox="0 0 24 24" width={40} height={40}>
                  <path d={PATH} fill="currentColor" className={n <= affichee ? 'text-plum' : 'text-sand'} />
                </svg>
              </button>
            ))}
          </div>
          <p className="mt-2 h-6 font-display text-lg text-plum">{LIBELLES[affichee]}</p>
        </div>

        <div>
          <label className="eyebrow">Soin reçu</label>
          <select
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className={field}
          >
            <option value="">— Choisir —</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nom}
              </option>
            ))}
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="eyebrow">Votre commentaire</label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Accueil, soin, résultat…"
            className={field}
          />
          <p className="mt-1 text-right text-xs text-ink/40">{commentaire.length}/1000</p>
        </div>

        <div>
          <label className="eyebrow">Prénom affiché</label>
          <input
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            maxLength={40}
            autoComplete="given-name"
            className={field}
          />
          <p className="mt-1 text-xs text-ink/45">
            Seul ce prénom sera visible publiquement (vous pouvez ajouter une initiale).
          </p>
        </div>

        {/* Champ piège invisible pour les robots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Site web
            <input tabIndex={-1} autoComplete="off" value={piege} onChange={(e) => setPiege(e.target.value)} />
          </label>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink/70">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-plum"
          />
          <span>
            Je confirme avoir reçu ce soin à l&apos;institut Palki et j&apos;accepte que
            mon avis et mon prénom soient publiés sur le site après vérification.
          </span>
        </label>

        {erreur && <p className="text-sm text-rose">{erreur}</p>}

        <button onClick={envoyer} disabled={envoi} className="btn-solid w-full disabled:opacity-50">
          {envoi ? 'Envoi…' : 'Envoyer mon avis'}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink/45">
          Vous avez reçu un lien personnel après votre rendez-vous&nbsp;? Utilisez-le
          plutôt : votre avis portera le badge «&nbsp;Rendez-vous vérifié&nbsp;».
        </p>
      </div>
    </div>
  );
}