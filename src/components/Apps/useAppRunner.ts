import { useState, useCallback, useRef } from 'react';
import { getProvider } from '../../services/providers';
import { getSecret } from '../../services/db';
import { decryptKey } from '../../services/crypto';
import { useAppStore } from '../../store/useAppStore';
import { saveAppSession } from '../../services/db';
import { Message } from '../../types';
import { AppSession } from '../../types/apps';

export function useAppRunner(appId: string) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings, passphrase } = useAppStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopRun = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsRunning(false);
    }
  }, []);

  const runPrompt = useCallback(async (
    systemPrompt: string,
    userPrompt: string,
    onChunk?: (text: string) => void
  ): Promise<string> => {
    setIsRunning(true);
    setError(null);
    abortControllerRef.current = new AbortController();
    
    let result = '';
    
    try {
      const provider = getProvider(settings.defaultProviderId);
      if (!provider) throw new Error("Provider not found");

      if (!passphrase) throw new Error("Vault is locked. Please unlock in settings to use apps.");

      const encrypted = await getSecret(provider.id);
      if (!encrypted) throw new Error(`API key for ${provider.name} not found. Please add your key in Settings.`);

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
        abortControllerRef.current?.signal,
        settings.proxyUrl,
        systemPrompt,
        { temperature: 0.2, max_tokens: 4096 }
      );

      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Generation stopped by user.');
      } else {
        setError(msg);
      }
      throw err;
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [settings, passphrase]);

  const saveSession = useCallback(async <TIn extends Record<string, unknown>, TOut extends Record<string, unknown>>(
    inputs: TIn,
    outputs: TOut
  ): Promise<AppSession<TIn, TOut>> => {
    const session: AppSession<TIn, TOut> = {
      id: Date.now().toString(),
      appId,
      timestamp: Date.now(),
      inputs,
      outputs,
      results: outputs,
      status: 'completed' as const
    };
    await saveAppSession(session);
    return session;
  }, [appId]);

  return { runPrompt, saveSession, stopRun, isRunning, error };
}
