export interface AppSession<TInputs = Record<string, unknown>, TOutputs = Record<string, unknown>> {
  id: string;
  appId: string;
  timestamp: number;
  inputs: TInputs;
  outputs?: TOutputs;
  results?: TOutputs;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

