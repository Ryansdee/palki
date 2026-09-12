import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GALLERY_DIR = path.join(process.cwd(), 'public', 'images', 'galeries');
const DATA_FILE = path.join(process.cwd(), 'data', 'galeries.json');

type Photo = {
  id: string;
  filename: string;
  url: string;
  title: string;
  uploadedAt: string;
};

async function readData(): Promise<Photo[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Photo[];
  } catch {
    return [];
  }
}

async function writeData(photos: Photo[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(photos, null, 2), 'utf-8');
}

export async function GET() {
  return NextResponse.json(await readData());
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const title = (formData.get('title') as string) || '';

  if (!files.length) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  await fs.mkdir(GALLERY_DIR, { recursive: true });
  const photos = await readData();
  const added: Photo[] = [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (path.extname(file.name) || '.jpg').toLowerCase();
    const filename = `${randomUUID()}${ext}`;
    await fs.writeFile(path.join(GALLERY_DIR, filename), bytes);
    added.push({
      id: randomUUID(),
      filename,
      url: `/images/galeries/${filename}`,
      title,
      uploadedAt: new Date().toISOString(),
    });
  }

  if (!added.length) {
    return NextResponse.json(
      { error: 'Aucune image valide.' },
      { status: 400 }
    );
  }

  await writeData([...added, ...photos]);
  return NextResponse.json(added, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = (await req.json()) as { id: string };
  const photos = await readData();
  const target = photos.find((p) => p.id === id);

  if (!target) {
    return NextResponse.json({ error: 'Photo introuvable.' }, { status: 404 });
  }

  try {
    await fs.unlink(path.join(GALLERY_DIR, target.filename));
  } catch {
    // fichier déjà absent
  }

  await writeData(photos.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}