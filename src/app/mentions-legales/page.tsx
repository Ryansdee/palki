'use client';

import { useEffect, useState } from 'react';
import { getSettings, DEFAULT_SETTINGS } from '@/lib/data';
import type { Settings } from '@/lib/types';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

// ─── À compléter avec les informations officielles de la cliente ─────
// (voir sa fiche sur https://kbopub.economie.fgov.be)
const EDITEUR = {
  nom: '[Palki]',
  forme: '[Indépendante en personne physique / SRL / …]',
  bce: '[0410.682.657]',
  tva: '[BE 0410.682.657 — ou « non assujettie à la TVA (franchise) »]',
  email: 'contact@palki.be',
  conservationMois: 24, // durée de conservation des réservations
  miseAJour: '4 novembre 2026',
};

const telAffiche = (tel: string) => {
  const n = tel.replace(/\D/g, '').replace(/^32/, '0');
  return n.length === 10 ? `${n.slice(0, 4)}/${n.slice(4, 7)}.${n.slice(7)}` : tel;
};

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-sand pt-10">
      <h2 className="font-display text-3xl text-ink">{titre}</h2>
      <div className="mt-5 space-y-4 leading-relaxed text-ink/75">{children}</div>
    </section>
  );
}

export default function MentionsLegales() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getSettings(ORG_ID).then(setSettings);
  }, []);

  const email = settings.email || EDITEUR.email;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <header className="text-center">
        <p className="eyebrow">Informations légales</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Mentions légales
        </h1>
        <p className="mt-4 text-sm text-ink/50">Dernière mise à jour : {EDITEUR.miseAJour}</p>
      </header>

      <div className="mt-16 space-y-12">
        <Section titre="Éditeur du site">
          <p>
            Le site <strong>palki.be</strong> est édité par{' '}
            <strong>{EDITEUR.nom}</strong> ({EDITEUR.forme}), exploitant l&apos;institut
            de beauté <strong>Palki — Au fil de la beauté</strong>.
          </p>
          <ul className="space-y-1">
            <li>Adresse : {settings.adresse}</li>
            <li>Téléphone : {telAffiche(settings.telephone)}</li>
            <li>E-mail : {email}</li>
            <li>Numéro d&apos;entreprise (BCE) : {EDITEUR.bce}</li>
            <li>TVA : {EDITEUR.tva}</li>
          </ul>
          <p className="text-sm text-ink/55">
            Informations fournies conformément aux articles III.74 et XII.6 du Code
            de droit économique.
          </p>
        </Section>

        <Section titre="Hébergement">
          <p>
            Site hébergé par <strong>Netlify, Inc.</strong>, San Francisco, Californie
            (États-Unis) — www.netlify.com.
          </p>
          Nom de domaine : <strong>palki.be</strong> — Certificat SSL fourni par (lws.fr).
          <p>
            Les données (réservations, contenus) sont stockées via{' '}
            <strong>Google Firebase</strong>, fourni pour l&apos;Europe par Google
            Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.
          </p>
          <p>
            Les données personnelles respectent le RGPD et sont conservées pendant {EDITEUR.conservationMois} mois après le dernier rendez-vous, puis supprimées.
          </p>
        </Section>

        <Section titre="Propriété intellectuelle">
          <p>
            Les textes, photographies, logo et éléments graphiques de ce site sont la
            propriété de Palki ou utilisés avec l&apos;autorisation de leurs auteurs.
            Toute reproduction, même partielle, sans autorisation écrite préalable est
            interdite (Livre XI du Code de droit économique).
          </p>
        </Section>

        <Section titre="Prix et rendez-vous">
          <p>
            Les prix affichés sont en euros, toutes taxes comprises. Les promotions
            sont valables pendant la période indiquée et dans la limite des conditions
            mentionnées.
          </p>
          <p>
            Une demande de rendez-vous envoyée via le site n&apos;est définitive
            qu&apos;après confirmation par l&apos;institut. En cas
            d&apos;empêchement, merci de prévenir au plus tôt au{' '}
            {telAffiche(settings.telephone)}.
          </p>
        </Section>

        <Section titre="Protection des données personnelles">
          <p>
            <strong>Responsable du traitement :</strong> {EDITEUR.nom}, {settings.adresse}{' '}
            — {email}.
          </p>
          <p>
            <strong>Données collectées :</strong> lors d&apos;une demande de
            rendez-vous, nous collectons vos nom et prénom, numéro de téléphone,
            adresse e-mail, le soin choisi, la date et l&apos;heure, ainsi
            qu&apos;une remarque éventuelle.
          </p>
          <p>
            <strong>Finalité et base légale :</strong> ces données servent uniquement
            à gérer votre rendez-vous et à vous contacter à ce sujet (mesures
            précontractuelles et exécution du service — article 6.1.b du RGPD). Elles
            ne sont jamais vendues ni utilisées à des fins publicitaires.
          </p>
          <p>
            <strong>Destinataires :</strong> l&apos;institut uniquement, ainsi que
            nos prestataires techniques (Netlify pour l&apos;hébergement, Google
            Firebase pour le stockage). Si vous confirmez votre demande via WhatsApp,
            le message est transmis par WhatsApp (Meta) selon ses propres conditions.
          </p>
          <p>
            <strong>Durée de conservation :</strong> {EDITEUR.conservationMois} mois
            après votre dernier rendez-vous, puis suppression.
          </p>
          <p>
            <strong>Vos droits :</strong> vous pouvez à tout moment demander
            l&apos;accès, la rectification ou la suppression de vos données, ou vous
            opposer à leur traitement, en écrivant à {email}. Vous pouvez également
            introduire une réclamation auprès de l&apos;Autorité de protection des
            données, rue de la Presse 35, 1000 Bruxelles — contact@apd-gba.be —
            www.autoriteprotectiondonnees.be.
          </p>
        </Section>

        <Section titre="Cookies">
          <p>
            Ce site n&apos;utilise aucun cookie publicitaire ni de mesure
            d&apos;audience. Seuls des éléments strictement nécessaires à son
            fonctionnement peuvent être utilisés (par exemple la connexion à
            l&apos;espace de gestion de l&apos;institut), ce qui ne nécessite pas votre
            consentement.
          </p>
        </Section>

        <Section titre="Droit applicable">
          <p>
            Le présent site et ces mentions sont régis par le droit belge. En cas de
            litige, et à défaut de solution amiable, les tribunaux de
            l&apos;arrondissement judiciaire de Bruxelles sont compétents, sans
            préjudice des règles impératives protégeant le consommateur.
          </p>
        </Section>
        <Section titre="Développeur du site">
          <p>
            Site développé par <strong>Ryansdee</strong> —{' '}
            <a href="https://ryansdee.netlify.app" target="_blank" rel="noopener noreferrer" className="text-plum underline">
              site de Ryansdee
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}