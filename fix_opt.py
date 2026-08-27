import re

# Add generateTextService to chatService.ts
with open('src/services/chatService.ts', 'r') as f:
    cs = f.read()

if 'export async function generateTextService' not in cs:
    generate_func = """
export async function generateTextService(prompt: string, signal?: AbortSignal): Promise<string> {
  const { settings, passphrase } = useAppStore.getState();
  const provider = getProvider(settings.defaultProviderId);
  if (!provider) throw new Error("Provider not found");
  
  let apiKey = '';
  const encrypted = await getSecret(provider.id);
  if (encrypted) {
    if (!passphrase) throw new Error("Vault locked");
    apiKey = await decryptKey(encrypted, passphrase);
  } else if (!provider.isOpenSource) {
    throw new Error("No API key");
  }

  const response = await provider.callModel(settings.defaultModelId, [{role: 'user', content: prompt}], apiKey, {}, signal);
  let fullText = '';
  for await (const chunk of response.stream) {
      fullText += chunk;
  }
  return fullText;
}
"""
    cs += generate_func
    with open('src/services/chatService.ts', 'w') as f:
        f.write(cs)

# Update PromptEditor.tsx to use it
with open('src/components/PromptVault/PromptEditor.tsx', 'r') as f:
    pe = f.read()

pe = pe.replace("import { sendMessageService } from '../../services/chatService';", "import { generateTextService } from '../../services/chatService';")
pe = pe.replace(
    "const response = await sendMessageService(tmpConvoId, prompt, null, controller.signal, true);\n      if (response && response.content) {\n        setText(response.content.trim());\n      }",
    "const result = await generateTextService(prompt, controller.signal);\n      if (result) {\n        setText(result.trim());\n      }"
)

with open('src/components/PromptVault/PromptEditor.tsx', 'w') as f:
    f.write(pe)

print("Optimization fixed")
