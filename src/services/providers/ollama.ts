import { ProviderAdapter } from './base';

export const ollamaAdapter: ProviderAdapter = {
  id: 'ollama',
  name: 'Ollama (Localhost)',
  models: [
    { id: 'llama3', name: 'Llama 3' },
    { id: 'phi3', name: 'Phi 3' },
    { id: 'mistral', name: 'Mistral' },
    { id: 'gemma', name: 'Gemma' }
  ],
  parseResponseStream: (chunk: any) => '',
  sendMessage: async (messages, modelId, apiKey, onUpdate, signal) => {
    // Note: apiKey is ignored for Ollama
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} - Ensure Ollama is running locally on port 11434 with CORS enabled.`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.trim().length > 0);
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            onUpdate(parsed.message.content);
          }
        } catch (e) {
          console.warn('Ollama parse error:', e);
        }
      }
    }
  }
};
