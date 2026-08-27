import re

with open('src/services/db.ts', 'r') as f:
    c = f.read()

# Add import if needed
if 'import { useAppStore }' not in c:
    c = "import { useAppStore } from '../store/useAppStore';\n" + c

# Replace getDB
c = re.sub(
    r'let dbPromise: Promise<IDBPDatabase<any>> \| null = null;.*?export function getDB\(\): Promise<IDBPDatabase<any>> \{.*?return dbPromise;\n\}',
    """let dbPromise: Promise<IDBPDatabase<any>> | null = null;
let currentDbName = 'omnichat-db';

export function getDB(): Promise<IDBPDatabase<any>> {
  const activeProfile = useAppStore.getState().activeProfile || 'default';
  const dbName = activeProfile === 'default' ? 'omnichat-db' : `omnichat-db-${activeProfile}`;
  
  if (dbPromise && currentDbName === dbName) {
    return dbPromise;
  }
  currentDbName = dbName;
  dbPromise = openDB(dbName, 4, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('conversations', { keyPath: 'id' });
        const pStore = db.createObjectStore('prompts', { keyPath: 'id' });
        pStore.createIndex('updatedAt', 'updatedAt');
        db.createObjectStore('promptFolders', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('promptVersions', { keyPath: 'id' });
        db.createObjectStore('secrets');
      }
      if (oldVersion < 3) {
        db.createObjectStore('promptChains', { keyPath: 'id' });
      }
      if (oldVersion < 4) {
        db.createObjectStore('abTests', { keyPath: 'id' });
      }
    }
  });
  return dbPromise;
}""", c, flags=re.DOTALL
)

if 'abTests' not in c:
    c += """
export async function saveABTest(test: any) {
  const db = await getDB();
  await db.put('abTests', test);
}
export async function getABTests(): Promise<any[]> {
  const db = await getDB();
  return db.getAll('abTests');
}
"""

with open('src/services/db.ts', 'w') as f:
    f.write(c)

print("DB modified")
