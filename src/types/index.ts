export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  parentId?: string | null;
  modelId?: string;
  providerId?: string;
  tokens?: { prompt: number; completion: number };
  cost?: number;
  pinned?: boolean;
  reaction?: 'up' | 'down' | null;
  isError?: boolean;
  isUsageEstimated?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  createdAt: number;
  systemPrompt?: string;
  pinned?: boolean;
  tags?: string[];
  isComparison?: boolean;
  comparisonModels?: Array<{ providerId: string; modelId: string }>;
  currentLeafId?: string;
  parameters?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export interface ProviderModel {
  id: string;
  name: string;
}

export interface PromptFolder {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  text: string;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  folderId?: string | null;
  isTemplate?: boolean;
  isFavorite?: boolean;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  text: string;
  timestamp: number;
}

export interface PromptChain {
  id: string;
  name: string;
  promptIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultProviderId: string;
  defaultModelId: string;
  proxyUrl?: string;
  autoLockEnabled?: boolean;
  autoLockTimeout?: number;
  onboardingComplete?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  uiDensity?: 'comfortable' | 'compact';
  parameterPresets?: Array<{
    name: string;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  }>;
  accentColor?: string;
  enterToSubmit?: boolean;
  customEndpointUrl?: string;
}

export interface EncryptedKey {
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface ContextBlock {
  id: string;
  title: string;
  content: string;
  isFavorite?: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  schedule: string; // simplistic representation, e.g., 'daily', 'weekly' or interval in ms
  promptId?: string;
  appId?: string;
  providerId?: string;
  modelId?: string;
  active: boolean;
  nextRun: number;
  lastRun?: number;
  createdAt: number;
}

export interface AppWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: Array<{ appId: string; inputs: any }>;
  createdAt: number;
  updatedAt: number;
}

export interface CustomApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: Array<{ name: string; type: string; description: string; required?: boolean }>;
  promptTemplate: string;
  createdAt: number;
  updatedAt: number;
}

export interface PrivacyNote {
  id: string;
  title: string;
  content: string; // EncryptedKey format
  iv: string;
  salt: string;
  createdAt: number;
  updatedAt: number;
}

export interface TaskResult {
  id: string;
  taskId: string;
  result: string;
  timestamp: number;
  isError?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
}

export interface ABTest {
  id: string;
  prompt: string;
  modelA: string;
  modelB: string;
  winner: 'A' | 'B' | 'none';
  timestamp: number;
}
