import re

# Update ModelSelector.tsx
with open('src/components/Chat/ModelSelector.tsx', 'r') as f:
    ms = f.read()

ms = ms.replace(
    'className="flex gap-1.5 items-center px-2 py-1 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 text-xs shadow-sm"',
    'className="flex gap-1.5 items-center px-3 py-1.5 luxury-glass rounded-xl shadow-md text-xs"'
)
ms = ms.replace(
    'className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none cursor-pointer pr-1"',
    'className="bg-transparent text-[var(--text-primary)] text-xs font-semibold outline-none cursor-pointer pr-1"'
)
ms = ms.replace(
    'className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none cursor-pointer pl-1 border-l border-slate-300 dark:border-slate-700 max-w-[140px] truncate"',
    'className="bg-transparent text-[var(--text-primary)] text-xs font-semibold outline-none cursor-pointer pl-2 ml-1 border-l border-[var(--glass-border)] max-w-[140px] truncate"'
)
ms = ms.replace(
    'className="flex gap-1.5 items-center bg-slate-100/90 dark:bg-slate-800/90 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs"',
    'className="flex gap-1.5 items-center luxury-glass px-3 py-2 shadow-sm text-xs"'
)
ms = ms.replace('text-slate-800 dark:text-slate-100', 'text-[var(--text-primary)]')
ms = ms.replace('bg-white dark:bg-slate-900', 'bg-[var(--bg-base)]')
ms = ms.replace('text-slate-900 dark:text-slate-100', 'text-[var(--text-primary)]')

ms = ms.replace(
    'className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${showParams ? \'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400\' : \'\'}`}',
    'className={`p-2 rounded-xl border border-[var(--glass-border)] transition-all duration-300 ${showParams ? \'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-105\' : \'luxury-glass hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]\'}`}'
)

ms = ms.replace(
    'className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100"',
    'className="absolute top-full right-0 mt-3 w-80 luxury-glass-panel shadow-[0_15px_40px_-5px_rgba(0,0,0,0.3)] p-5 z-50 text-[var(--text-primary)] animate-slide-up border border-[var(--glass-border)]"'
)

ms = ms.replace('accent-blue-600', 'accent-[var(--accent-color)]')
ms = ms.replace('bg-slate-200 dark:bg-slate-700', 'bg-[var(--bg-surface-hover)]')
ms = ms.replace('bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', 'luxury-input')
ms = ms.replace('text-blue-500', 'text-[var(--accent-color)]')

with open('src/components/Chat/ModelSelector.tsx', 'w') as f:
    f.write(ms)

print("Selector updated")
