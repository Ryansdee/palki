'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink/40">
        Chargement…
      </div>
    );
  }

  if (user) return <>{children}</>;

  async function login() {
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(getAuthClient(), email, password);
    } catch {
      setError('Identifiants incorrects.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="frame mb-10 inline-block px-6 py-3">
          <span className="font-sans text-lg font-light tracking-[0.4em] text-ink">
            PALKI
          </span>
        </div>
        <h1 className="font-display text-3xl text-ink">Espace administration</h1>
        <div className="mt-8 space-y-3">
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
            onKeyDown={(e) => e.key === 'Enter' && login()}
            className="w-full border border-sand bg-cloud px-4 py-3 outline-none focus:border-plum"
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <button
            onClick={login}
            disabled={busy}
            className="btn-solid w-full disabled:opacity-50"
          >
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
