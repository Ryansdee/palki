'use client';

import { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuthClient, getDbClient } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { TenantProvider, type Tenant, type TenantRole } from '@/lib/tenant-context';

const PRODUCT_NAME = 'PALKI';

type Mode = 'login' | 'signup';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [resolving, setResolving] = useState(false);

  // Résolution du tenant une fois l'utilisateur authentifié
  useEffect(() => {
    let active = true;
    if (!user) {
      setTenant(null);
      return;
    }
    setResolving(true);
    (async () => {
      try {
        const db = getDbClient();
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!active) return;
        if (!userSnap.exists()) {
          setTenant(null);
          setError("Aucun espace n'est associé à ce compte.");
          return;
        }
        const data = userSnap.data();
        const orgSnap = await getDoc(doc(db, 'orgs', data.orgId));
        if (!active) return;
        setTenant({
          orgId: data.orgId,
          orgName: orgSnap.data()?.name ?? '—',
          role: (data.role ?? 'member') as TenantRole,
          plan: orgSnap.data()?.plan ?? 'free',
        });
      } catch (err) {
        console.error('tenant resolve', err);
        if (active) setError('Impossible de charger votre espace.');
      } finally {
        if (active) setResolving(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // Connexion / inscription depuis l'écran d'accueil
  async function submit() {
    setBusy(true);
    setError('');
    try {
      const auth = getAuthClient();
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!orgName.trim()) {
          setError("Le nom de l'établissement est requis.");
          setBusy(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const db = getDbClient();
        const orgRef = doc(collection(db, 'orgs'));
        const batch = writeBatch(db);
        batch.set(orgRef, {
          name: orgName.trim(),
          ownerId: cred.user.uid,
          plan: 'free',
          createdAt: serverTimestamp(),
        });
        batch.set(doc(db, 'users', cred.user.uid), {
          email,
          orgId: orgRef.id,
          role: 'owner' as TenantRole,
          createdAt: serverTimestamp(),
        });
        await batch.commit();
      }
    } catch (err) {
      console.error('auth submit', err);
      setError(
        mode === 'login'
          ? 'Identifiants incorrects.'
          : "Impossible de créer le compte (email déjà utilisé ?)."
      );
    } finally {
      setBusy(false);
    }
  }

  // Rattachement d'un compte Auth existant sans tenant (comptes pré-SaaS)
  async function attachOrg() {
    if (!user) return;
    if (!orgName.trim()) {
      setError("Le nom de l'établissement est requis.");
      return;
    }
    setBusy(true);
    setError('');
    try {
      const db = getDbClient();
      const orgRef = doc(collection(db, 'orgs'));
      const batch = writeBatch(db);
      batch.set(orgRef, {
        name: orgName.trim(),
        ownerId: user.uid,
        plan: 'free',
        createdAt: serverTimestamp(),
      });
      batch.set(doc(db, 'users', user.uid), {
        email: user.email ?? '',
        orgId: orgRef.id,
        role: 'owner' as TenantRole,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      setTenant({
        orgId: orgRef.id,
        orgName: orgName.trim(),
        role: 'owner',
        plan: 'free',
      });
    } catch (err) {
      console.error('attach org', err);
      setError("Impossible de créer l'espace.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || (user && resolving)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink/40">
        Chargement…
      </div>
    );
  }

  if (user && tenant) {
    return <TenantProvider value={tenant}>{children}</TenantProvider>;
  }

  // Compte connecté sans tenant : proposer de créer l'espace à la volée
  if (user && !tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="frame mb-10 inline-block px-6 py-3">
            <span className="font-sans text-lg font-light tracking-[0.4em] text-ink">
              {PRODUCT_NAME}
            </span>
          </div>
          <h1 className="font-display text-3xl text-ink">Créer votre espace</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            Ce compte n’est encore rattaché à aucun établissement. Donnez-lui un
            nom pour initialiser votre espace.
          </p>
          <div className="mt-8 space-y-3">
            <input
              type="text"
              placeholder="Nom de l'établissement"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-sand bg-cloud px-4 py-3 outline-none focus:border-plum"
            />
            {error && <p className="text-sm text-rose">{error}</p>}
            <button
              onClick={attachOrg}
              disabled={busy}
              className="btn-solid w-full disabled:opacity-50"
            >
              {busy ? 'Création…' : "Créer l'espace"}
            </button>
            <button
              type="button"
              onClick={() => signOut(getAuthClient())}
              className="w-full text-center text-sm text-ink/50 hover:text-plum"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Non connecté : connexion / inscription
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="frame mb-10 inline-block px-6 py-3">
          <span className="font-sans text-lg font-light tracking-[0.4em] text-ink">
            {PRODUCT_NAME}
          </span>
        </div>
        <h1 className="font-display text-3xl text-ink">
          {mode === 'login' ? 'Connexion' : 'Créer un espace'}
        </h1>
        <div className="mt-8 space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Nom de l'établissement"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-sand bg-cloud px-4 py-3 outline-none focus:border-plum"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-sand bg-cloud px-4 py-3 outline-none focus:border-plum"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full border border-sand bg-cloud px-4 py-3 outline-none focus:border-plum"
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <button
            onClick={submit}
            disabled={busy}
            className="btn-solid w-full disabled:opacity-50"
          >
            {busy
              ? mode === 'login'
                ? 'Connexion…'
                : 'Création…'
              : mode === 'login'
                ? 'Se connecter'
                : "Créer l'espace"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="w-full text-center text-sm text-ink/50 hover:text-plum"
          >
            {mode === 'login'
              ? 'Pas encore de compte ? Créer un espace'
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}