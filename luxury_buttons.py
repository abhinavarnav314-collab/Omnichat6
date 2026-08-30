import re

# Update App.tsx buttons
with open('src/App.tsx', 'r') as f:
    app_tsx = f.read()

app_tsx = app_tsx.replace('className="w-full flex items-center justify-between p-2 rounded hover:bg-[var(--bg-surface-hover)] transition-colors text-left group"', 
                          'className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[var(--glass-bg)] transition-all duration-300 text-left group hover:shadow-sm"')
app_tsx = app_tsx.replace('className="w-full text-left p-2 rounded flex flex-col gap-1 transition-colors hover:bg-[var(--bg-surface-hover)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"',
                          'className="w-full text-left p-4 rounded-2xl flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md luxury-glass"')
app_tsx = app_tsx.replace('className="w-full flex items-center gap-2 p-2 rounded hover:bg-[var(--bg-surface-hover)] transition-colors text-left"',
                          'className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--glass-bg)] transition-all duration-300 text-left hover:shadow-sm"')

with open('src/App.tsx', 'w') as f:
    f.write(app_tsx)

# Update ChatWindow.tsx buttons
with open('src/components/Chat/ChatWindow.tsx', 'r') as f:
    cw = f.read()

cw = cw.replace('className="px-5 py-2.5 bg-[var(--accent-color)] text-white rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-sm"',
                'className="luxury-button-primary"')

cw = re.sub(
    r'className={`flex items-center gap-1\.5 text-xs font-semibold px-2\.5 py-1\.5 rounded-lg transition-colors border \$\{.*?\}\`\}',
    r'className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-300 ${activeConvo.isComparison ? \'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105\' : \'luxury-glass hover:bg-[var(--bg-surface-hover)] text-slate-700 dark:text-slate-200\'}`}',
    cw, flags=re.DOTALL
)

cw = cw.replace('className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isPromptVaultOpen ? \'bg-slate-200 dark:bg-slate-700 text-[var(--accent-color)]\' : \'text-slate-600 dark:text-slate-300\'}`}',
                'className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${isPromptVaultOpen ? \'bg-[var(--accent-color)] text-white shadow-lg\' : \'luxury-glass hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]\'}`}')

cw = cw.replace('className={`p-1.5 rounded-lg hidden xl:flex items-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${showInsights ? \'bg-slate-200 dark:bg-slate-700 text-[var(--accent-color)]\' : \'\'}`}',
                'className={`p-2 rounded-xl hidden xl:flex items-center transition-all duration-300 ${showInsights ? \'bg-[var(--accent-color)] text-white shadow-lg\' : \'luxury-glass hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]\'}`}')


with open('src/components/Chat/ChatWindow.tsx', 'w') as f:
    f.write(cw)


# Update PromptList.tsx
with open('src/components/PromptVault/PromptList.tsx', 'r') as f:
    pl = f.read()

pl = pl.replace('className="p-2 hover:bg-[var(--bg-surface-hover)] rounded transition-colors"',
                'className="p-2 hover:bg-[var(--glass-bg)] rounded-xl transition-all duration-300 active:scale-95"')

pl = pl.replace('className={`w-full text-left p-3 rounded-lg border transition-all ${',
                'className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${')
pl = pl.replace('? \'border-[var(--accent-color)] bg-[var(--accent-color)]/5\'',
                '? \'border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]\'')
pl = pl.replace(': \'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]\'',
                ': \'border-[var(--glass-border)] luxury-glass hover:border-[var(--accent-color)]/50\'')

with open('src/components/PromptVault/PromptList.tsx', 'w') as f:
    f.write(pl)


print("Buttons upgraded!")
