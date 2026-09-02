import { useAppStore } from '../store/useAppStore';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  Conversation,
  Prompt,
  EncryptedKey,
  PromptFolder,
  PromptVersion,
  PromptChain,
  ContextBlock,
  ScheduledTask,
  AppWorkflow,
  CustomApp,
  PrivacyNote,
  TaskResult,
  UserProfile,
  ABTest,
} from '../types';

interface OmniChatDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { updatedAt: number; profileId: string; };
  };
  prompts: {
    key: string;
    value: Prompt;
    indexes: { updatedAt: number; folderId: string; profileId: string; };
  };
  promptFolders: {
    key: string;
    value: PromptFolder;
  };
  promptVersions: {
    key: string;
    value: PromptVersion;
    indexes: { promptId: string; timestamp: number };
  };
  promptChains: {
    key: string;
    value: PromptChain;
  };
  abTests: {
    key: string;
    value: ABTest;
    indexes: { timestamp: number; profileId: string; };
  };
  profiles: {
    key: string;
    value: UserProfile;
  };
  secrets: {
    key: string;
    value: EncryptedKey;
  };
  appSessions: {
    key: string;
    value: any;
    indexes: { appId: string, timestamp: number };
  };
  contextBlocks: {
    key: string;
    value: ContextBlock;
  };
  tasks: {
    key: string;
    value: ScheduledTask;
  };
  taskResults: {
    key: string;
    value: TaskResult;
    indexes: { taskId: string };
  };
  workflows: {
    key: string;
    value: AppWorkflow;
  };
  customApps: {
    key: string;
    value: CustomApp;
  };
  privacyVault: {
    key: string;
    value: PrivacyNote;
  };
}

let dbPromise: Promise<IDBPDatabase<OmniChatDB>> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OmniChatDB>('omniChat-db', 6, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          const cStore = db.createObjectStore('conversations', {
            keyPath: 'id',
          });
          cStore.createIndex('updatedAt', 'updatedAt');
          const pStore = db.createObjectStore('prompts', { keyPath: 'id' });
          pStore.createIndex('updatedAt', 'updatedAt');
          db.createObjectStore('secrets');
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('promptFolders')) {
            db.createObjectStore('promptFolders', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('promptVersions')) {
            const vStore = db.createObjectStore('promptVersions', {
              keyPath: 'id',
            });
            vStore.createIndex('promptId', 'promptId');
            vStore.createIndex('timestamp', 'timestamp');
          }
          if (db.objectStoreNames.contains('prompts')) {
            const pStore = transaction.objectStore('prompts');
            if (!pStore.indexNames.contains('folderId')) {
              pStore.createIndex('folderId', 'folderId');
            }
          }
        }
        if (oldVersion < 3) {
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
        }
        if (oldVersion < 5) {
          if (!db.objectStoreNames.contains('contextBlocks')) {
            db.createObjectStore('contextBlocks', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('tasks')) {
            db.createObjectStore('tasks', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('taskResults')) {
            const trStore = db.createObjectStore('taskResults', { keyPath: 'id' });
            trStore.createIndex('taskId', 'taskId');
          }
          if (!db.objectStoreNames.contains('workflows')) {
            db.createObjectStore('workflows', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('customApps')) {
            db.createObjectStore('customApps', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('privacyVault')) {
            db.createObjectStore('privacyVault', { keyPath: 'id' });
          }
        }
        if (oldVersion < 6) {
          if (!db.objectStoreNames.contains('profiles')) {
            db.createObjectStore('profiles', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('abTests')) {
            const abStore = db.createObjectStore('abTests', { keyPath: 'id' });
            abStore.createIndex('timestamp', 'timestamp');
            abStore.createIndex('profileId', 'profileId');
          } else {
            const abStore = transaction.objectStore('abTests');
            if (!abStore.indexNames.contains('timestamp')) {
              abStore.createIndex('timestamp', 'timestamp');
            }
            if (!abStore.indexNames.contains('profileId')) {
              abStore.createIndex('profileId', 'profileId');
            }
          }
          const cStore = transaction.objectStore('conversations');
          if (!cStore.indexNames.contains('profileId')) {
            cStore.createIndex('profileId', 'profileId');
          }
          const pStore = transaction.objectStore('prompts');
          if (!pStore.indexNames.contains('profileId')) {
            pStore.createIndex('profileId', 'profileId');
          }
        }
      },
    });
  }
  return dbPromise;
}

// Conversation Ops
export async function getConversationsByProfile(profileId: string): Promise<Conversation[]> {
  const db = await getDB();
  return db.getAllFromIndex('conversations', 'profileId', profileId);
}

export async function getConversations(): Promise<Conversation[]> {
  const db = await getDB();
  return db.getAllFromIndex('conversations', 'updatedAt');
}
export async function saveConversation(convo: Conversation) {
  const db = await getDB();
  await db.put('conversations', convo);
}
export async function deleteConversation(id: string) {
  const db = await getDB();
  await db.delete('conversations', id);
}

// Prompts Ops
export async function getPromptsByProfile(profileId: string): Promise<Prompt[]> {
  const db = await getDB();
  return db.getAllFromIndex('prompts', 'profileId', profileId);
}

export async function getPrompts(): Promise<Prompt[]> {
  const db = await getDB();
  return db.getAllFromIndex('prompts', 'updatedAt');
}
export async function savePrompt(prompt: Prompt) {
  const db = await getDB();
  await db.put('prompts', prompt);
}
export async function deletePrompt(id: string) {
  const db = await getDB();
  await db.delete('prompts', id);
}

// Folders Ops
export async function getPromptFolders(): Promise<PromptFolder[]> {
  const db = await getDB();
  return db.getAll('promptFolders');
}
export async function savePromptFolder(folder: PromptFolder) {
  const db = await getDB();
  await db.put('promptFolders', folder);
}
export async function deletePromptFolder(id: string) {
  const db = await getDB();
  await db.delete('promptFolders', id);
}

// Versions Ops
export async function getAllPromptVersions(): Promise<PromptVersion[]> {
  const db = await getDB();
  return db.getAll('promptVersions');
}

export async function getPromptVersions(
  promptId: string
): Promise<PromptVersion[]> {
  const db = await getDB();
  const versions = await db.getAllFromIndex(
    'promptVersions',
    'promptId',
    promptId
  );
  return versions.sort((a, b) => b.timestamp - a.timestamp);
}
export async function savePromptVersion(version: PromptVersion) {
  const db = await getDB();
  await db.put('promptVersions', version);
  // Keep only last 5
  const versions = await getPromptVersions(version.promptId);
  if (versions.length > 5) {
    const toDelete = versions.slice(5);
    for (const v of toDelete) {
      await db.delete('promptVersions', v.id);
    }
  }
}

// Chains Ops
export async function getPromptChains(): Promise<PromptChain[]> {
  const db = await getDB();
  return db.getAll('promptChains');
}
export async function savePromptChain(chain: PromptChain) {
  const db = await getDB();
  await db.put('promptChains', chain);
}
export async function deletePromptChain(id: string) {
  const db = await getDB();
  await db.delete('promptChains', id);
}

// Secrets Ops
export async function saveSecret(key: string, secret: EncryptedKey) {
  const db = await getDB();
  await db.put('secrets', secret, key);
}
export async function getSecret(
  key: string
): Promise<EncryptedKey | undefined> {
  const db = await getDB();
  return db.get('secrets', key);
}
export async function deleteSecret(key: string) {
  const db = await getDB();
  await db.delete('secrets', key);
}

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

export async function clearAllData() {
  const db = await getDB();
  const stores = db.objectStoreNames;
  const tx = db.transaction(stores, 'readwrite');
  const promises = [];
  for (let i = 0; i < stores.length; i++) {
    promises.push(tx.objectStore(stores[i]).clear());
  }
  await Promise.all(promises);
  await tx.done;
}

export async function saveABTest(test: ABTest): Promise<void> {
  const db = await getDB();
  await db.put('abTests', test);
}
export async function getABTests(profileId?: string): Promise<ABTest[]> {
  const db = await getDB();
  if (profileId) {
    return db.getAllFromIndex('abTests', 'profileId', profileId);
  }
  return db.getAll('abTests');
}
export async function deleteABTest(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('abTests', id);
}

export async function getProfiles(): Promise<UserProfile[]> {
  const db = await getDB();
  return db.getAll('profiles');
}
export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.put('profiles', profile);
}
export async function deleteProfile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('profiles', id);
}

export async function exportAllData(): Promise<Record<string, any[]>> {
  const db = await getDB();
  const stores = ['conversations', 'prompts', 'promptFolders', 'promptVersions', 'promptChains', 'appSessions', 'abTests', 'contextBlocks', 'tasks', 'taskResults', 'workflows', 'customApps', 'privacyVault'] as const;
  const backup: Record<string, any[]> = {};
  for (const store of stores) {
    if (db.objectStoreNames.contains(store)) {
      backup[store] = await db.getAll(store);
    }
  }
  return backup;
}

export async function importAllData(data: Record<string, any[]>): Promise<void> {
  const db = await getDB();
  for (const [storeName, items] of Object.entries(data)) {
    if (db.objectStoreNames.contains(storeName as any) && Array.isArray(items)) {
      for (const item of items) {
        await db.put(storeName as any, item);
      }
    }
  }
}

// --- NEW STORES CRUD ---

export async function getContextBlocks(): Promise<ContextBlock[]> {
  const db = await getDB();
  return db.getAll('contextBlocks');
}
export async function saveContextBlock(block: ContextBlock) {
  const db = await getDB();
  await db.put('contextBlocks', block);
}
export async function deleteContextBlock(id: string) {
  const db = await getDB();
  await db.delete('contextBlocks', id);
}

export async function getTasks(): Promise<ScheduledTask[]> {
  const db = await getDB();
  return db.getAll('tasks');
}
export async function saveTask(task: ScheduledTask) {
  const db = await getDB();
  await db.put('tasks', task);
}
export async function deleteTask(id: string) {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function getTaskResults(taskId?: string): Promise<TaskResult[]> {
  const db = await getDB();
  if (taskId) {
    return db.getAllFromIndex('taskResults', 'taskId', taskId);
  }
  return db.getAll('taskResults');
}
export async function saveTaskResult(result: TaskResult) {
  const db = await getDB();
  await db.put('taskResults', result);
}

export async function getWorkflows(): Promise<AppWorkflow[]> {
  const db = await getDB();
  return db.getAll('workflows');
}
export async function saveWorkflow(workflow: AppWorkflow) {
  const db = await getDB();
  await db.put('workflows', workflow);
}
export async function deleteWorkflow(id: string) {
  const db = await getDB();
  await db.delete('workflows', id);
}

export async function getCustomApps(): Promise<CustomApp[]> {
  const db = await getDB();
  return db.getAll('customApps');
}
export async function saveCustomApp(app: CustomApp) {
  const db = await getDB();
  await db.put('customApps', app);
}
export async function deleteCustomApp(id: string) {
  const db = await getDB();
  await db.delete('customApps', id);
}

export async function getPrivacyNotes(): Promise<PrivacyNote[]> {
  const db = await getDB();
  return db.getAll('privacyVault');
}
export async function savePrivacyNote(note: PrivacyNote) {
  const db = await getDB();
  await db.put('privacyVault', note);
}
export async function deletePrivacyNote(id: string) {
  const db = await getDB();
  await db.delete('privacyVault', id);
}

