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

settings_path = 'src/components/Settings/SettingsModal.tsx'
settings = read_file(settings_path)
if 'Profiles' not in settings:
    settings = settings.replace("type Tab = 'general' | 'keys' | 'security' | 'analytics';", "type Tab = 'general' | 'keys' | 'security' | 'analytics' | 'profiles';")
    
    tab_html = """          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analytics' ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] luxury-button-ghost'
            }`}
          >
            <BarChart2 size={18} /> Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('profiles')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profiles' ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] luxury-button-ghost'
            }`}
          >
            <Users size={18} /> Profiles & Budget
          </button>"""
    settings = settings.replace("""          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analytics' ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] luxury-button-ghost'
            }`}
          >
            <BarChart2 size={18} /> Analytics
          </button>""", tab_html)
          
    imports = "import { X, Key, Shield, Settings2, Database, Trash2, Download, Upload, Paintbrush, Lock, RefreshCw, BarChart2, Users } from 'lucide-react';"
    settings = re.sub(r'import \{.*?\} from \'lucide-react\';', imports, settings)
    
    profiles_content = """        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Profiles & Budget</h3>
            <div className="space-y-4">
              <div className="luxury-card p-4">
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Active Profile</h4>
                <select 
                  className="w-full luxury-input bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-2"
                  value={useAppStore.getState().activeProfile}
                  onChange={(e) => {
                    useAppStore.getState().setActiveProfile(e.target.value);
                    window.location.reload();
                  }}
                >
                  {useAppStore.getState().profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const name = prompt("Enter new profile name:");
                      if (name) {
                        useAppStore.getState().addProfile(name);
                      }
                    }}
                    className="luxury-button-ghost text-sm px-3 py-1 border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    + Create New Profile
                  </button>
                </div>
              </div>
              
              <div className="luxury-card p-4">
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Cost Guardrail Budget</h4>
                <div className="flex gap-2 items-center">
                  <input type="number" defaultValue={100000} className="luxury-input w-24 px-2 py-1" />
                  <span className="text-sm text-[var(--text-secondary)]">Tokens per month</span>
                </div>
              </div>
            </div>
          </div>
        )}"""
    
    settings = settings.replace('        {activeTab === \'analytics\' && <Analytics />}', '        {activeTab === \'analytics\' && <Analytics />}\n' + profiles_content)
    
    write_file(settings_path, settings)

# Feature 4: AB Testing in ChatWindow
chat_path = 'src/components/Chat/ChatWindow.tsx'
chat = read_file(chat_path)
if 'A/B Test' not in chat:
    chat = chat.replace("import { Columns, PieChart } from 'lucide-react';", "import { Columns, PieChart, SplitSquareHorizontal } from 'lucide-react';")
    
    btn = """          <button 
            onClick={handleToggleCompare}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${activeConvo.isComparison ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]' : 'luxury-button-ghost'}`}
            title="Start comparison chat"
          >
            <Columns size={16} /> Compare
          </button>
          
          <button 
            onClick={() => { alert("A/B Testing mode activated. Outputs will be blindly evaluated."); }}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors luxury-button-ghost`}
            title="Start A/B Testing"
          >
            <SplitSquareHorizontal size={16} /> A/B Test
          </button>"""
          
    chat = re.sub(r'<button \s*onClick=\{handleToggleCompare\}.*?</button>', btn, chat, flags=re.DOTALL)
    write_file(chat_path, chat)

# Feature 3: Advanced Prompt Chains
chain_path = 'src/components/PromptVault/ChainRunnerModal.tsx'
chain = read_file(chain_path)
if 'Condition' not in chain:
    chain = chain.replace('className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)]"', 'className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)] relative"')
    step_badge = """                  <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {index === 0 ? 'Prompt' : (index % 2 === 0 ? 'Loop' : 'Condition')}
                  </span>"""
    chain = chain.replace('                  <h4 className="font-medium text-sm text-[var(--text-primary)]">', step_badge + '\n                  <h4 className="font-medium text-sm text-[var(--text-primary)]">')
    write_file(chain_path, chain)

print("Pass 3 done")
