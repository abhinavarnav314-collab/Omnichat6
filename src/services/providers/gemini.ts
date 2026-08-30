import { ProviderAdapter, handleProviderError } from './base';
import { Message, ProviderModel } from '../../types';

export class GeminiAdapter implements ProviderAdapter {
  id = 'gemini';
  name = 'Google Gemini';
  models: ProviderModel[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview (Thinking)' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)' },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Latest)' },
  ];

  // Resolve aliases if needed
  private resolveModelId(modelId: string): string {
    if (modelId === 'gemini-1.5-pro-latest') return 'gemini-1.5-pro';
    if (modelId === 'gemini-1.5-flash-latest') return 'gemini-1.5-flash';
    return modelId;
  }

  async sendMessage(
    messages: Message[],
    model: string,
    apiKey: string,
    onUpdate: (chunk: string) => void,
    signal?: AbortSignal,
    proxyUrl?: string,
    systemPrompt?: string,
    parameters?: any,
    onUsage?: (usage: { prompt: number; completion: number }) => void
  ): Promise<void> {
    const resolvedModel = this.resolveModelId(model);

    // Sanitize and ensure consecutive alternating roles for Gemini API
    const sanitizedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const m of messages) {
      const text = m.content?.trim();
      if (!text && m.role === 'user') continue;
      const role = m.role === 'assistant' ? 'model' : 'user';
      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += `\n\n${text || ''}`;
      } else {
        sanitizedContents.push({
          role,
          parts: [{ text: text || ' ' }]
        });
      }
    }

    // Gemini requires starting with a user turn
    if (sanitizedContents.length === 0) {
      sanitizedContents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    } else if (sanitizedContents[0].role === 'model') {
      sanitizedContents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const payload: any = { contents: sanitizedContents };
    
    if (systemPrompt && systemPrompt.trim()) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt.trim() }]
      };
    }
    
    const genConfig: any = {};
    if (parameters) {
      if (parameters.temperature !== undefined && !resolvedModel.includes('preview')) {
        genConfig.temperature = parameters.temperature;
      }
      if (parameters.top_p !== undefined) {
        genConfig.topP = parameters.top_p;
      }
      if (parameters.max_tokens !== undefined && !resolvedModel.includes('preview')) {
        genConfig.maxOutputTokens = parameters.max_tokens;
      }
    }
    
    if (resolvedModel === 'gemini-3.1-pro-preview') {
      genConfig.thinkingConfig = { thinkingLevel: 'HIGH' };
    }

    if (Object.keys(genConfig).length > 0) {
      payload.generationConfig = genConfig;
    }

    const cleanKey = apiKey.trim();
    let fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:streamGenerateContent?alt=sse`;
    if (proxyUrl) {
      const targetUrl = encodeURIComponent(fetchUrl);
      const separator = proxyUrl.includes('?') ? '&' : '?';
      fetchUrl = `${proxyUrl}${separator}target=${targetUrl}`;
    }

    let response;
    try {
      response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey
        },
        body: JSON.stringify(payload),
        signal
      });
    } catch (err: any) {
      throw handleProviderError(err, this.name);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw handleProviderError(new Error(`Gemini API Error (${response.status}): ${errText}`), this.name, response.status);
    }

    if (!response.body) throw new Error("No response body received from Gemini API");
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    
    let promptTokens = 0;
    let completionTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = trimmed.slice(6).trim();
            if (data === '[DONE]') continue;
            const parsed = JSON.parse(data);
            
            if (parsed.usageMetadata) {
              promptTokens = parsed.usageMetadata.promptTokenCount || 0;
              completionTokens = parsed.usageMetadata.candidatesTokenCount || 0;
            }
            
            const chunkText = this.parseResponseStream(parsed);
            if (chunkText) onUpdate(chunkText);
          } catch (e) {
            console.warn("Parse error for Gemini chunk", trimmed);
          }
        }
      }
    }
    
    if (onUsage && (promptTokens > 0 || completionTokens > 0)) {
      onUsage({ prompt: promptTokens, completion: completionTokens });
    }
  }

  parseResponseStream(chunk: any): string {
    const parts = chunk?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((p: any) => p.text || '').join('');
    }
    return '';
  }
}

export const geminiAdapter = new GeminiAdapter();

