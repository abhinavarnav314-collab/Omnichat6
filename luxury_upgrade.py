import re
import os

# 1. Update index.css
css = """@import "tailwindcss";

@theme {
  --color-border-subtle: var(--border-subtle);
}

@layer base {
  :root {
    --bg-base: #f8fafc;
    --bg-surface: rgba(255, 255, 255, 0.7);
    --bg-surface-hover: rgba(255, 255, 255, 0.9);
    --border-subtle: rgba(0, 0, 0, 0.05);
    --border-strong: rgba(0, 0, 0, 0.1);
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --accent-gradient-start: #6366f1;
    --accent-gradient-end: #a855f7;
    --accent-color: #8b5cf6;
    --glass-bg: rgba(255, 255, 255, 0.65);
    --glass-border: rgba(255, 255, 255, 0.5);
    --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  }

  .dark {
    --bg-base: #030712;
    --bg-surface: rgba(17, 24, 39, 0.65);
    --bg-surface-hover: rgba(31, 41, 55, 0.85);
    --border-subtle: rgba(255, 255, 255, 0.08);
    --border-strong: rgba(255, 255, 255, 0.15);
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
    --accent-gradient-start: #818cf8;
    --accent-gradient-end: #c084fc;
    --accent-color: #a78bfa;
    --glass-bg: rgba(17, 24, 39, 0.5);
    --glass-border: rgba(255, 255, 255, 0.08);
    --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  }
  
  body {
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}

@layer components {
  .luxury-glass {
    background: var(--glass-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-glass);
  }
  
  .luxury-glass-panel {
    @apply luxury-glass rounded-3xl overflow-hidden;
  }

  .luxury-button-primary {
    @apply bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] text-white font-semibold rounded-full px-6 py-2.5 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-white/10;
  }

  .luxury-button-ghost {
    @apply text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-2xl px-4 py-2 transition-all duration-300 active:scale-[0.98];
  }

  .luxury-input {
    @apply luxury-glass focus:border-transparent text-[var(--text-primary)] rounded-2xl px-5 py-3 outline-none transition-all duration-300 focus:shadow-[0_0_0_2px_var(--accent-color)] focus:bg-[var(--bg-surface-hover)];
  }

  .message-bubble-user {
    @apply bg-gradient-to-br from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] text-white rounded-3xl rounded-tr-sm shadow-md;
  }

  .message-bubble-assistant {
    @apply luxury-glass rounded-3xl rounded-tl-sm shadow-sm;
  }
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slide-up {
  animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}
.animate-float {
  animation: float 12s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(167, 139, 250, 0); }
  100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
}
.animate-pulse-ring {
  animation: pulse-ring 2s infinite;
}
"""
with open('src/index.css', 'w') as f:
    f.write(css)

# 2. App.tsx Update
with open('src/App.tsx', 'r') as f:
    app_tsx = f.read()

app_tsx = app_tsx.replace(
    'className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden text-sm"',
    'className="flex h-screen w-full text-[var(--text-primary)] overflow-hidden text-sm relative p-2 md:p-4 gap-2 md:gap-4 z-0 bg-transparent"'
)

bg_decor = """      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 fixed">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-gradient-start)] opacity-20 blur-[120px] animate-float"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-gradient-end)] opacity-20 blur-[120px] animate-float" style={{animationDelay: '4s'}}></div>
      </div>
"""
app_tsx = app_tsx.replace('{/* Main Sidebar */}', bg_decor + '\n      {/* Main Sidebar */}')

app_tsx = re.sub(
    r'className=\{`flex flex-col bg-\[var\(--bg-surface\)\] border-r border-\[var\(--border-subtle\)\] transition-all duration-300 \$\{isSidebarOpen \? \'w-64\' : \'w-0 opacity-0 overflow-hidden\'\}`\}',
    r'className={`flex flex-col luxury-glass-panel transition-all duration-500 ease-in-out z-20 ${isSidebarOpen ? \'w-72 opacity-100 shadow-2xl translate-x-0\' : \'w-0 opacity-0 overflow-hidden border-none -translate-x-full\'}`}',
    app_tsx
)

app_tsx = app_tsx.replace(
    'className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)] shadow-xl z-10"',
    'className="flex-1 flex flex-col min-w-0 luxury-glass-panel z-10 relative overflow-hidden shadow-2xl animate-slide-up"'
)

app_tsx = app_tsx.replace(
    'className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0"',
    'className="p-5 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0 bg-gradient-to-r from-[var(--bg-surface)] to-transparent"'
)

app_tsx = app_tsx.replace(
    'className="absolute top-3 left-3 z-30 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-md hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"',
    'className="absolute top-5 left-5 z-30 p-2.5 luxury-glass rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"'
)

app_tsx = app_tsx.replace(
    'className="absolute top-4 right-4 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card rounded-md shadow-sm hover:bg-[var(--bg-surface-hover)]"',
    'className="absolute top-5 right-5 z-30 p-2.5 luxury-glass rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"'
)

with open('src/App.tsx', 'w') as f:
    f.write(app_tsx)


# 3. ChatWindow.tsx Update
with open('src/components/Chat/ChatWindow.tsx', 'r') as f:
    cw = f.read()

cw = cw.replace('bg-[var(--bg-base)]', 'bg-transparent')
cw = cw.replace('bg-[var(--bg-surface)]/80', 'bg-transparent')
cw = cw.replace('backdrop-blur', '') # We use luxury-glass now where needed

with open('src/components/Chat/ChatWindow.tsx', 'w') as f:
    f.write(cw)


# 4. MessageList.tsx Update
with open('src/components/Chat/MessageList.tsx', 'r') as f:
    ml = f.read()

ml = ml.replace(
    'className="max-w-[85%] rounded-2xl px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm"',
    'className="max-w-[85%] px-5 py-4 message-bubble-user animate-slide-up"'
)
ml = re.sub(
    r'className=\{`flex-1 min-w-0 rounded-2xl p-4 bg-\[var\(--bg-base\)\] border border-\[var\(--border-subtle\)\] shadow-sm \$\{msg\.isError \? \'border-red-500/50 bg-red-50 dark:bg-red-900/10\' : \'\'\}`\}',
    r'className={`flex-1 min-w-0 p-6 message-bubble-assistant animate-slide-up ${msg.isError ? \'border-red-500/50 bg-red-50 dark:bg-red-900/10\' : \'\'}`}',
    ml
)
ml = ml.replace('bg-[var(--bg-surface)] p-2 rounded-full', 'luxury-glass p-2.5 rounded-2xl shadow-lg')
ml = ml.replace('bg-[var(--bg-surface-hover)]', 'luxury-glass')

with open('src/components/Chat/MessageList.tsx', 'w') as f:
    f.write(ml)


# 5. MessageInput.tsx Update
with open('src/components/Chat/MessageInput.tsx', 'r') as f:
    mi = f.read()

mi = mi.replace(
    'className="w-full pl-4 pr-12 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none overflow-hidden"',
    'className="w-full pl-5 pr-14 py-4 luxury-input resize-none overflow-hidden shadow-sm"'
)
mi = mi.replace(
    'className="absolute right-2 bottom-2 p-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color)]/90 transition-colors disabled:opacity-50"',
    'className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100"'
)

with open('src/components/Chat/MessageInput.tsx', 'w') as f:
    f.write(mi)

# 6. PromptList.tsx Update
with open('src/components/PromptVault/PromptList.tsx', 'r') as f:
    pl = f.read()

pl = pl.replace(
    'className="flex flex-col h-full bg-[var(--bg-base)] border-l border-[var(--border-subtle)] w-80 shrink-0"',
    'className="flex flex-col h-full w-80 shrink-0 luxury-glass-panel shadow-2xl transition-all duration-500 ease-in-out z-20"'
)
pl = pl.replace('bg-[var(--bg-surface)] luxury-card', 'luxury-input')
pl = pl.replace('bg-[var(--bg-surface)]', 'luxury-glass')

with open('src/components/PromptVault/PromptList.tsx', 'w') as f:
    f.write(pl)

print("Luxury upgrade applied!")
