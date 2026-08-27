import re

with open('src/services/chatService.ts', 'r') as f:
    cs = f.read()

# Replace the faulty generateTextService
old_func = re.search(r'export async function generateTextService.*?return fullText;\n}', cs, re.DOTALL).group(0)

new_func = """export async function generateTextService(prompt: string, signal?: AbortSignal): Promise<string> {
  const { settings, passphrase } = useAppStore.getState();
  const provider = getProvider(settings.defaultProviderId);
  if (!provider) throw new Error("Provider not found");
  
  let apiKey = '';
  const encrypted = await getSecret(provider.id);
  if (encrypted) {
    if (!passphrase) throw new Error("Vault locked");
    apiKey = await decryptKey(encrypted, passphrase);
  }

  let fullText = '';
  await provider.sendMessage(
    [{id: 'tmp', role: 'user', content: prompt, timestamp: Date.now()}], 
    settings.defaultModelId, 
    apiKey, 
    (chunk) => { fullText += chunk; }, 
    signal, 
    settings.corsProxyUrl || undefined
  );
  return fullText;
}"""

cs = cs.replace(old_func, new_func)

with open('src/services/chatService.ts', 'w') as f:
    f.write(cs)
print("generateTextService fixed")
