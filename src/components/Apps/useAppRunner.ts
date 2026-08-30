import { useState, useCallback } from 'react';
import { getProvider } from '../../services/providers';
import { getSecret } from '../../services/db';
import { decryptKey } from '../../services/crypto';
import { useAppStore } from '../../store/useAppStore';
import { saveAppSession } from '../../services/db';
import { Message } from '../../types';

export function useAppRunner(appId: string) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings, passphrase } = useAppStore();

  const runPrompt = useCallback(async (
    systemPrompt: string,
    userPrompt: string,
    onChunk?: (text: string) => void
  ): Promise<string> => {
    setIsRunning(true);
    setError(null);
    
    let result = '';
    
    try {
      const provider = getProvider(settings.defaultProviderId);
      if (!provider) throw new Error("Provider not found");

      if (!passphrase) throw new Error("Vault is locked. Please unlock in settings to use apps.");

      const encrypted = await getSecret(provider.id);
      if (!encrypted) throw new Error(`API key for ${provider.name} not found.`);

      const apiKey = await decryptKey(encrypted, passphrase);

      const messages: Message[] = [
        { id: '1', role: 'user', content: userPrompt, timestamp: Date.now() }
      ];

      await provider.sendMessage(
        messages,
        settings.defaultModelId,
        apiKey,
        (chunk) => {
          result += chunk;
          if (onChunk) onChunk(result);
        },
        undefined, // no abort signal for now
        settings.proxyUrl,
        systemPrompt,
        { temperature: 0.2, max_tokens: 4096 }
      );

      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, [settings, passphrase]);

  const saveSession = useCallback(async (inputs: any, results: any) => {
    const session = {
      id: Date.now().toString(),
      appId,
      timestamp: Date.now(),
      inputs,
      results,
      status: 'completed' as const
    };
    await saveAppSession(session);
    return session;
  }, [appId]);

  return { runPrompt, saveSession, isRunning, error };
}
