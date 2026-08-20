import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-6 py-40 text-center">
      <div className="frame px-10 py-6">
        <span className="font-display text-6xl text-ink">404</span>
      </div>
      <p className="mt-8 font-display text-2xl text-ink/70">
        Cette page n’existe pas.
      </p>
      <Link href="/" className="btn-solid mt-8">
        Retour à l’accueil
      </Link>
    </div>
  );
}
