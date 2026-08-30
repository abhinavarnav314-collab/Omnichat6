import re
import os

def upgrade_modal(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()

    # Backdrop
    content = content.replace('bg-black/50 backdrop-blur-sm', 'bg-black/40 backdrop-blur-md')
    
    # Modal Card
    content = content.replace('bg-[var(--bg-base)] rounded-xl shadow-2xl', 'luxury-glass-panel shadow-2xl border border-[var(--glass-border)] animate-slide-up')
    content = content.replace('bg-[var(--bg-surface)] rounded-xl shadow-xl border border-[var(--border-subtle)]', 'luxury-glass-panel shadow-2xl border border-[var(--glass-border)] animate-slide-up')

    # Inputs
    content = content.replace('bg-slate-50 dark:bg-slate-800 border border-[var(--border-subtle)]', 'luxury-input')
    content = content.replace('bg-slate-50 dark:bg-slate-800 rounded border border-[var(--border-subtle)]', 'luxury-input')
    
    # Save Button
    content = content.replace('bg-[var(--accent-color)] hover:bg-[var(--accent-color)] text-white rounded', 'luxury-button-primary')
    content = content.replace('px-4 py-2 bg-[var(--accent-color)] text-white rounded', 'luxury-button-primary')

    # Other buttons
    content = content.replace('luxury-button-ghost rounded', 'luxury-button-ghost')
    content = content.replace('bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg', 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 hover:from-purple-500/30 hover:to-fuchsia-500/30 text-purple-600 dark:text-purple-300 rounded-xl border border-purple-500/20')

    with open(filepath, 'w') as f:
        f.write(content)

upgrade_modal('src/components/PromptVault/PromptEditor.tsx')
upgrade_modal('src/components/PromptVault/PromptInsertModal.tsx')
upgrade_modal('src/components/PromptVault/ChainRunnerModal.tsx')
upgrade_modal('src/components/Settings/SettingsModal.tsx')
upgrade_modal('src/components/Settings/ApiKeyManager.tsx')

print("Modals upgraded")
