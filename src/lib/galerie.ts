// Galerie photos : fichiers dans Firebase Storage (galerie/{orgId}/…),
// liste dans la collection Firestore "galerie", scopée par orgId.

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface PhotoGalerie {
  id: string;
  url: string;
  path: string; // chemin Storage, sert à la suppression
  legende?: string;
  ordre: number;
  createdAt: number;
}

export async function getPhotos(orgId: string): Promise<PhotoGalerie[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'galerie'), where('orgId', '==', orgId))
    );
    return snap.docs
      .map((d) => {
        const { orgId: _o, ...data } = d.data() as Omit<PhotoGalerie, 'id'> & {
          orgId: string;
        };
        return { id: d.id, ...data };
      })
      .sort((a, b) => a.ordre - b.ordre || b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

// Compresse côté navigateur : max 1600 px de large, JPEG qualité 0.8.
export async function compresserImage(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, 'image/jpeg', quality)
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // format non décodable (ex. HEIC) : envoi tel quel
  }
}

export async function ajouterPhoto(
  orgId: string,
  file: File,
  legende: string,
  ordre: number
): Promise<void> {
  const blob = await compresserImage(file);
  const ext = blob.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop() || 'jpg';
  const path = `galerie/${orgId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, blob, { contentType: blob.type || file.type });
  const url = await getDownloadURL(fileRef);
  await addDoc(collection(db, 'galerie'), {
    orgId,
    url,
    path,
    legende: legende.trim(),
    ordre,
    createdAt: Date.now(),
  });
}

export const modifierPhoto = (
  id: string,
  patch: Partial<Pick<PhotoGalerie, 'legende' | 'ordre'>>
) => updateDoc(doc(db, 'galerie', id), patch);

export async function supprimerPhoto(p: PhotoGalerie): Promise<void> {
  if (p.path) {
    await deleteObject(ref(storage, p.path)).catch(() => {
      /* fichier déjà absent */
    });
  }
  await deleteDoc(doc(db, 'galerie', p.id));
}