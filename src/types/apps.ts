export interface AppSession {
  id: string;
  appId: string;
  timestamp: number;
  inputs: Record<string, any>;
  results: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}
