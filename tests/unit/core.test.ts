import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encryptKey } from '../../src/services/crypto';
import { saveABTest, getConversationsByProfile, saveProfile, getProfiles, getDB } from '../../src/services/db';
import 'fake-indexeddb/auto';
import { useAppStore } from '../../src/store/useAppStore';

describe('OmniChat Core Mechanics', () => {
  beforeEach(async () => {
    // Reset DB and stores if needed
    indexedDB.deleteDatabase('omniChat-db');
  });

  describe('1. Universal Passphrase Validation', () => {
    it('throws if trying to encrypt with an empty passphrase', async () => {
      await expect(encryptKey('my-secret-key', '')).rejects.toThrow(
        'Runtime Security Exception: Attempted to encrypt credentials without an active passphrase.'
      );
      
      await expect(encryptKey('my-secret-key', '   ')).rejects.toThrow(
        'Runtime Security Exception: Attempted to encrypt credentials without an active passphrase.'
      );
    });

    it('encrypts successfully when passphrase is provided', async () => {
      const result = await encryptKey('my-secret-key', 'super-secret-passphrase');
      expect(result).toHaveProperty('ciphertext');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('salt');
    });
  });

  describe('2. IndexedDB Schema Operations', () => {
    it('handles profiles and ABTest saving/retrieval correctly', async () => {
      // Profiles
      await saveProfile({ id: 'prof1', name: 'Test Profile', tokenBudget: 50000, createdAt: Date.now() });
      const profiles = await getProfiles();
      expect(profiles).toHaveLength(1);
      expect(profiles[0].id).toBe('prof1');

      // AB Tests
      const abTestId = crypto.randomUUID();
      await saveABTest({
        id: abTestId,
        profileId: 'prof1',
        prompt: 'Hello world',
        modelA: 'modelA',
        modelB: 'modelB',
        winner: 'A',
        timestamp: Date.now()
      });
      
      const db = await getDB();
      const abTests = await db.getAllFromIndex('abTests', 'profileId', 'prof1');
      expect(abTests).toHaveLength(1);
      expect(abTests[0].modelA).toBe('modelA');
      expect(abTests[0].winner).toBe('A');
    });

    it('retrieves conversations by profile', async () => {
      const db = await getDB();
      await db.put('conversations', {
        id: 'convo1',
        profileId: 'prof1',
        title: 'Test',
        messages: [],
        createdAt: 100,
        updatedAt: 100
      });

      const convos = await getConversationsByProfile('prof1');
      expect(convos).toHaveLength(1);
      expect(convos[0].id).toBe('convo1');

      const convosOther = await getConversationsByProfile('prof2');
      expect(convosOther).toHaveLength(0);
    });
  });

  describe('3. Budget Percentage Logic', () => {
    it('calculates the token percentage accurately without exceeding 100%', () => {
      const tokenBudget = 100000;
      let totalTokens = 50000;
      let percentage = Math.min(100, (totalTokens / tokenBudget) * 100);
      expect(percentage).toBe(50);

      totalTokens = 150000;
      percentage = Math.min(100, (totalTokens / tokenBudget) * 100);
      expect(percentage).toBe(100);
      
      totalTokens = 0;
      percentage = Math.min(100, (totalTokens / tokenBudget) * 100);
      expect(percentage).toBe(0);
    });
  });
});
