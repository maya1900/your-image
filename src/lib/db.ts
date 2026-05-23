import { openDB, type IDBPDatabase } from 'idb';
import type { Creation } from '@/types/creation';

const DB_NAME = 'your-image-db';
const VERSION = 1;
const STORE = 'creations';

interface YourImageDB {
  creations: Creation;
}

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(STORE)) {
          const store = d.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('by-createdAt', 'createdAt');
          store.createIndex('by-favorite', 'favorite');
        }
      },
    });
  }
  return dbPromise;
}

export async function addCreation(c: Creation): Promise<void> {
  const db = await getDB();
  await db.put(STORE, c);
}

export async function getCreation(id: string): Promise<Creation | undefined> {
  const db = await getDB();
  return db.get(STORE, id) as Promise<Creation | undefined>;
}

export async function listCreations(): Promise<Creation[]> {
  const db = await getDB();
  const all = (await db.getAllFromIndex(STORE, 'by-createdAt')) as Creation[];
  return all.reverse();
}

export async function deleteCreation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function updateCreation(id: string, patch: Partial<Creation>): Promise<void> {
  const db = await getDB();
  const cur = (await db.get(STORE, id)) as Creation | undefined;
  if (!cur) return;
  await db.put(STORE, { ...cur, ...patch });
}

export async function clearCreations(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE);
}

export type { YourImageDB };
