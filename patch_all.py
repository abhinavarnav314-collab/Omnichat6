import os
import re

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

write_file('src/services/providers/fireworks.ts', """import { OpenAICompatibleAdapter } from './base';
import { ProviderModel } from '../../types';

export class FireworksAIAdapter extends OpenAICompatibleAdapter {
  id = 'fireworks';
  name = 'Fireworks AI';
  models: ProviderModel[] = [
    { id: 'accounts/fireworks/models/llama-v3-70b-instruct', name: 'accounts/fireworks/models/llama-v3-70b-instruct' }
  ];

  constructor() {
    super('https://api.fireworks.ai/inference/v1/chat/completions');
  }
}

export const fireworksAdapter = new FireworksAIAdapter();
""")

write_file('src/services/providers/deepseek.ts', """import { OpenAICompatibleAdapter } from './base';
import { ProviderModel } from '../../types';

export class DeepSeekAdapter extends OpenAICompatibleAdapter {
  id = 'deepseek';
  name = 'DeepSeek';
  models: ProviderModel[] = [
    { id: 'deepseek-chat', name: 'deepseek-chat' },
    { id: 'deepseek-coder', name: 'deepseek-coder' }
  ];

  constructor() {
    super('https://api.deepseek.com/v1/chat/completions');
  }
}

export const deepseekAdapter = new DeepSeekAdapter();
""")

