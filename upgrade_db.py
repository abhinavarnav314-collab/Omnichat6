import re

with open('src/services/db.ts', 'r') as f:
    db = f.read()

# Update interface
db = db.replace(
    '  secrets: {\n    key: string;\n    value: EncryptedKey;\n  };\n}',
    '  secrets: {\n    key: string;\n    value: EncryptedKey;\n  };\n  appSessions: {\n    key: string;\n    value: any;\n    indexes: { appId: string, timestamp: number };\n  };\n}'
)

# Update version and upgrade logic
db = db.replace('openDB<OmniChatDB>(\'omniChat-db\', 3, {', 'openDB<OmniChatDB>(\'omniChat-db\', 4, {')
upgrade_block = """        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains('promptChains')) {
            db.createObjectStore('promptChains', { keyPath: 'id' });
          }
        }
        if (oldVersion < 4) {
          if (!db.objectStoreNames.contains('appSessions')) {
            const sStore = db.createObjectStore('appSessions', { keyPath: 'id' });
            sStore.createIndex('appId', 'appId');
            sStore.createIndex('timestamp', 'timestamp');
          }
        }"""
db = db.replace("""        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains('promptChains')) {
            db.createObjectStore('promptChains', { keyPath: 'id' });
          }
        }""", upgrade_block)

# Add ops
ops = """
// App Session Ops
export async function getAppSessions(appId?: string): Promise<any[]> {
  const db = await getDB();
  if (appId) {
    const sessions = await db.getAllFromIndex('appSessions', 'appId', appId);
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }
  return db.getAll('appSessions');
}
export async function saveAppSession(session: any) {
  const db = await getDB();
  await db.put('appSessions', session);
}
export async function deleteAppSession(id: string) {
  const db = await getDB();
  await db.delete('appSessions', id);
}

export async function clearAllData() {"""
db = db.replace('export async function clearAllData() {', ops)

with open('src/services/db.ts', 'w') as f:
    f.write(db)
print("db updated")
