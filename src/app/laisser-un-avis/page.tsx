'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getInvitationAvis, envoyerAvis } from '@/lib/data';
import type { AvisInvitation } from '@/lib/types';

const PATH =
  'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z';

const LIBELLES = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];

function Formulaire() {
  const token = useSearchParams().get('t') ?? '';

  const [inv, setInv] = useState<AvisInvitation | null>(null);
  const [chargement, setChargement] = useState(true);
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [prenom, setPrenom] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    getInvitationAvis(token).then((i) => {
      setInv(i);
      if (i) setPrenom(i.prenom);
      setChargement(false);
    });
  }, [token]);

  async function envoyer() {
    if (!inv) return;
    if (!note) return setErreur('Choisissez une note de 1 à 5 étoiles.');
    if (commentaire.trim().length < 5) return setErreur('Ajoutez quelques mots sur votre expérience.');
    setErreur('');
    setEnvoi(true);
    try {
      await envoyerAvis(token, inv, { prenom, note, commentaire });
      setEnvoye(true);
    } catch {
      setErreur('Cet avis a déjà été envoyé, ou le lien n’est plus valide.');
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <div className="mx-auto max-w-xl px-6 py-32" />;

  if (!inv) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl text-ink">Lien invalide</h1>
         <p className="mt-6 leading-relaxed text-ink/70">
          Ce lien d&apos;avis n&apos;existe pas ou a expiré. Vous êtes venue sans
          réserver en ligne&nbsp;? Vous pouvez quand même nous laisser un avis.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/laisser-un-avis-sans-reservation" className="btn-solid">Laisser un avis</Link>
          <Link href="/" className="btn-outline">Retour à l&apos;accueil</Link>
        </div>
        </div>
    );
  }

  if (envoye) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <div className="frame inline-block px-10 py-8">
          <h1 className="font-display text-4xl text-ink">Merci {prenom} !</h1>
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
        <h1 className="mt-4 font-display text-5xl text-ink">Bonjour {inv.prenom}</h1>
        <p className="mt-5 leading-relaxed text-ink/70">
          Comment s&apos;est passé votre soin «&nbsp;{inv.prestation}&nbsp;» chez Palki ?
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
            className={field}
          />
          <p className="mt-1 text-xs text-ink/45">
            Seul ce prénom sera visible publiquement (vous pouvez ajouter une initiale).
          </p>
        </div>

        {erreur && <p className="text-sm text-rose">{erreur}</p>}

        <button onClick={envoyer} disabled={envoi} className="btn-solid w-full disabled:opacity-50">
          {envoi ? 'Envoi…' : 'Publier mon avis'}
        </button>
      </div>
    </div>
  );
}

export default function LaisserUnAvis() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-6 py-32" />}>
      <Formulaire />
    </Suspense>
  );
}