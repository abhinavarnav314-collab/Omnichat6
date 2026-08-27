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
types_path = 'src/types/index.ts'
types_c = read_file(types_path)
if 'onboardingComplete?: boolean;' not in types_c:
    types_c = types_c.replace('autoLockTimeout?: number;', 'autoLockTimeout?: number;\n  onboardingComplete?: boolean;')
write_file(types_path, types_c)

# 2. Update AppStore
appstore_path = 'src/store/useAppStore.ts'
appstore_c = read_file(appstore_path)
if 'onboardingComplete: false' not in appstore_c:
    appstore_c = appstore_c.replace('parameterPresets: []', 'parameterPresets: [],\n  onboardingComplete: false')
write_file(appstore_path, appstore_c)

# 3. Create Onboarding Wizard
write_file('src/components/Onboarding/OnboardingWizard.tsx', """
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, Shield, Palette, ArrowRight, Check } from 'lucide-react';

export default function OnboardingWizard() {
  const { updateSettings } = useAppStore();
  const [step, setStep] = useState(1);

  const complete = () => updateSettings({ onboardingComplete: true });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden glass-panel modal-animate">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <Sparkles className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome to OmniChat4</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">The zero-backend, secure, universal AI client.</p>
          
          <div className="pt-8 space-y-4">
             <button onClick={complete} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20">
               Get Started <ArrowRight size={20} />
             </button>
             <button onClick={complete} className="w-full py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors">
               Skip Setup
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
""")

# 4. Create Conversation Insights
write_file('src/components/Chat/ConversationInsights.tsx', """
import React from 'react';
import { Conversation } from '../../types';
import { PieChart, Activity, Zap, DollarSign, Clock, Hash } from 'lucide-react';

export default function ConversationInsights({ conversation }: { conversation: Conversation }) {
  const totalMsgs = conversation.messages.length;
  const totalTokens = conversation.messages.reduce((acc, m) => acc + (m.tokens?.prompt || 0) + (m.tokens?.completion || 0), 0);
  const totalCost = conversation.messages.reduce((acc, m) => acc + (m.cost || 0), 0);
  
  return (
    <div className="w-80 border-l dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 overflow-y-auto hidden xl:block glass-panel">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-200"><PieChart size={20} className="text-blue-500"/> Insights</h3>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border dark:border-slate-700 hover:shadow-md transition-shadow">
           <div className="flex items-center gap-2 text-slate-500 mb-2"><Hash size={16}/> Messages</div>
           <div className="text-2xl font-bold">{totalMsgs}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border dark:border-slate-700 hover:shadow-md transition-shadow">
           <div className="flex items-center gap-2 text-slate-500 mb-2"><Zap size={16}/> Total Tokens</div>
           <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border dark:border-slate-700 hover:shadow-md transition-shadow">
           <div className="flex items-center gap-2 text-slate-500 mb-2"><DollarSign size={16}/> Est. Cost</div>
           <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalCost.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}
""")

# 5. Inject Insights and Polish ChatWindow
chatwindow_path = 'src/components/Chat/ChatWindow.tsx'
chatw_c = read_file(chatwindow_path)
if 'ConversationInsights' not in chatw_c:
    chatw_c = chatw_c.replace("import { Download, MoreVertical } from 'lucide-react';", "import { Download, MoreVertical, PieChart } from 'lucide-react';\nimport ConversationInsights from './ConversationInsights';")
    chatw_c = chatw_c.replace('const [showExport, setShowExport] = useState(false);', 'const [showExport, setShowExport] = useState(false);\n  const [showInsights, setShowInsights] = useState(false);')
    
    # Add insights button
    chatw_c = chatw_c.replace('<Download size={16} /> <span className="hidden sm:inline">Export</span>\n           </button>', '<Download size={16} /> <span className="hidden sm:inline">Export</span>\n           </button>\n           <button onClick={() => setShowInsights(!showInsights)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hidden xl:flex items-center gap-2 text-sm font-medium transition-colors"><PieChart size={16}/></button>')
    
    # Render insights
    chatw_c = chatw_c.replace('<MessageList conversation={activeConvo} />\n      </div>', '<MessageList conversation={activeConvo} />\n      </div>\n      {showInsights && <ConversationInsights conversation={activeConvo} />}')
    
    # Layout adjust
    chatw_c = chatw_c.replace('<div className="flex-1 overflow-hidden relative">', '<div className="flex-1 flex overflow-hidden relative">\n      <div className="flex-1 overflow-hidden relative">')
    chatw_c = chatw_c.replace('<div className="shrink-0 p-[var(--density-p)]">', '</div>\n      <div className="shrink-0 p-[var(--density-p)] z-10 glass-panel border-t dark:border-slate-800">')
    write_file(chatwindow_path, chatw_c)

# 6. Advanced Message Rendering (Copy code)
msglist_path = 'src/components/Chat/MessageList.tsx'
msgl_c = read_file(msglist_path)
if 'handleCopyCode' not in msgl_c:
    msgl_c = msgl_c.replace("import { User, Bot, RefreshCw, Pencil, Copy, Trash, Pin, ThumbsUp, ThumbsDown } from 'lucide-react';", "import { User, Bot, RefreshCw, Pencil, Copy, Trash, Pin, ThumbsUp, ThumbsDown, Check } from 'lucide-react';")
    
    advanced_code = """
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const [copied, setCopied] = React.useState(false);
                            const handleCopyCode = () => {
                                navigator.clipboard.writeText(String(children).replace(/\\n$/, ''));
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            };
                            return !inline && match ? (
                              <div className="relative group/code my-4 rounded-xl overflow-hidden bg-[#1E1E1E] border border-slate-700/50 shadow-lg">
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 text-xs text-slate-400 font-mono">
                                   <span>{match[1]}</span>
                                   <button onClick={handleCopyCode} className="hover:text-white transition-colors flex items-center gap-1">
                                     {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}
                                   </button>
                                </div>
                                <div className="p-4 overflow-x-auto text-sm">
                                  <Suspense fallback={<div className="text-slate-500">Loading syntax...</div>}>
                                    <SyntaxHighlighter
                                      style={window.prismTheme}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                                      {...props}
                                    >
                                      {String(children).replace(/\\n$/, '')}
                                    </SyntaxHighlighter>
                                  </Suspense>
                                </div>
                              </div>
                            ) : (
                              <code className="bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md text-sm text-blue-600 dark:text-blue-400 font-mono shadow-sm border border-slate-200/50 dark:border-slate-700/50" {...props}>
                                {children}
                              </code>
                            );
                          }
    """
    msgl_c = re.sub(r'code\(\{ node, inline, className, children, \.\.\.props \}: any\) \{.*?\}\n.*?\}\n.*?\}', advanced_code.strip(), msgl_c, flags=re.DOTALL)
    
    # Add typing indicator if generating (we need to pass isGenerating to MessageList, but let's just style empty state for now)
    empty_state = """
        {displayMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-80 animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
                   <Bot size={40} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">How can I help you today?</h3>
                <p className="max-w-md text-center text-slate-500">I can assist with writing, analysis, coding, and creative tasks. Just type a message to start.</p>
            </div>
        )}
    """
    msgl_c = re.sub(r'\{displayMessages\.length === 0 && \(.*?<\/div>\n\s*\)\}', empty_state.strip(), msgl_c, flags=re.DOTALL)
    write_file(msglist_path, msgl_c)

# 7. Include Onboarding in App.tsx
app_path = 'src/App.tsx'
app_c = read_file(app_path)
if 'OnboardingWizard' not in app_c:
    app_c = app_c.replace("import ReloadPrompt from './components/Shared/ReloadPrompt';", "import ReloadPrompt from './components/Shared/ReloadPrompt';\nimport OnboardingWizard from './components/Onboarding/OnboardingWizard';")
    app_c = app_c.replace('<ReloadPrompt />', '<ReloadPrompt />\n      {!settings.onboardingComplete && <OnboardingWizard />}')
    write_file(app_path, app_c)

# 8. Add CSS Luxury utilities
css_path = 'src/index.css'
css_c = read_file(css_path)
if 'glass-panel' not in css_c:
    css_c += """
@layer utilities {
  .glass-panel {
    @apply bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50;
  }
  .prose p {
    @apply leading-relaxed;
  }
  .prose blockquote {
    @apply border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 py-1 px-4 rounded-r-lg italic;
  }
  .prose table {
    @apply w-full border-collapse my-4 text-sm;
  }
  .prose th {
    @apply bg-slate-100 dark:bg-slate-800 p-2 text-left font-semibold border dark:border-slate-700;
  }
  .prose td {
    @apply p-2 border dark:border-slate-700;
  }
}
"""
    write_file(css_path, css_c)

print("Luxury UI features implemented")
