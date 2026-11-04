// Étoiles de notation (affichage). Gère les demi-notes : 4,3 → 4 étoiles pleines
// et la 5e remplie à 30 %.

const PATH =
  'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z';

export default function Etoiles({
  note,
  taille = 18,
  className = '',
}: {
  note: number;
  taille?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${note.toLocaleString('fr-BE')} sur 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const remplissage = Math.max(0, Math.min(1, note - i)) * 100;
        return (
          <span key={i} className="relative inline-block" style={{ width: taille, height: taille }}>
            <svg viewBox="0 0 24 24" width={taille} height={taille} className="absolute inset-0 text-sand">
              <path d={PATH} fill="currentColor" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${remplissage}%` }}>
              <svg viewBox="0 0 24 24" width={taille} height={taille} className="text-plum">
                <path d={PATH} fill="currentColor" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}