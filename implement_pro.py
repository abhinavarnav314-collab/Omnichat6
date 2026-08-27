import os
import re

def read_file(path):
    if not os.path.exists(path): return ""
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

# 1. Update Types
types_ts = read_file('src/types/index.ts')
if 'export interface UserProfile' not in types_ts:
    types_ts += """
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
"""
    write_file('src/types/index.ts', types_ts)

# 2. Update useAppStore
app_store = read_file('src/store/useAppStore.ts')
if 'profiles:' not in app_store:
    app_store = app_store.replace('interface AppState {', 'interface AppState {\n  activeProfile: string;\n  profiles: UserProfile[];\n  tokenBudget: number;\n  setActiveProfile: (id: string) => void;\n  addProfile: (name: string) => void;')
    app_store = app_store.replace('const defaultSettings: AppSettings = {', 'const defaultSettings: AppSettings = {')
    app_store = app_store.replace('return {', """return {
    activeProfile: 'default',
    profiles: [{ id: 'default', name: 'Default Profile' }],
    tokenBudget: 100000,
    setActiveProfile: (id) => set({ activeProfile: id }),
    addProfile: (name) => set(state => ({ profiles: [...state.profiles, { id: Date.now().toString(), name }] })),
""")
    write_file('src/store/useAppStore.ts', app_store)

print("Pass 1 done")
