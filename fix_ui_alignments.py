import re

# 1. Update App.tsx
with open('src/App.tsx', 'r') as f:
    app_tsx = f.read()

sidebar_header_old = """<div className="p-4 flex items-center gap-2 border-b border-[var(--border-subtle)] shrink-0">
          <MessageSquare className="text-[var(--accent-color)]" />
          <h1 className="font-bold text-lg tracking-tight">OmniChat</h1>
        </div>"""
sidebar_header_new = """<div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-[var(--accent-color)]" />
            <h1 className="font-bold text-lg tracking-tight">OmniChat</h1>
          </div>
          <button onClick={toggleSidebar} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded hover:bg-[var(--bg-surface-hover)]" title="Close Sidebar">
            <Menu size={16} />
          </button>
        </div>"""
app_tsx = app_tsx.replace(sidebar_header_old, sidebar_header_new)

toggle_old = """{/* Toggle Buttons */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-20 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
        title="Toggle Sidebar (Ctrl+\\)"
      >
        <Menu size={16} />
      </button>
      <button
        onClick={togglePromptVault}
        className="absolute top-4 right-4 z-20 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
        title="Toggle Prompt Vault (Ctrl+/)"
      >
        <Menu size={16} />
      </button>"""
toggle_new = """{/* Toggle Buttons */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card rounded-md shadow-sm hover:bg-[var(--bg-surface-hover)]"
          title="Open Sidebar (Ctrl+\\)"
        >
          <Menu size={16} />
        </button>
      )}
      {!isPromptVaultOpen && (
        <button
          onClick={togglePromptVault}
          className="absolute top-4 right-4 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card rounded-md shadow-sm hover:bg-[var(--bg-surface-hover)]"
          title="Open Prompt Vault (Ctrl+/)"
        >
          <Menu size={16} />
        </button>
      )}"""
app_tsx = app_tsx.replace(toggle_old, toggle_new)

with open('src/App.tsx', 'w') as f:
    f.write(app_tsx)


# 2. Update PromptList.tsx
with open('src/components/PromptVault/PromptList.tsx', 'r') as f:
    prompt_list = f.read()

if 'useAppStore' not in prompt_list:
    prompt_list = prompt_list.replace("import { usePromptStore }", "import { useAppStore } from '../../store/useAppStore';\nimport { usePromptStore }")
    prompt_list = prompt_list.replace("Link } from 'lucide-react';", "Link, Menu } from 'lucide-react';")
    
    prompt_list = prompt_list.replace("const { prompts, folders, chains,", "const { togglePromptVault } = useAppStore();\n  const { prompts, folders, chains,")
    
    pl_header_old = """<div className="flex gap-1">
              <button onClick={() => setIsCreating(true)} className="p-1.5 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-color)]" title="New Prompt">+</button>
              <button onClick={() => {
                  const name = prompt("Folder Name:");
                  if(name) addFolder(name);
              }} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600" title="New Folder"><Folder size={14} /></button>
              <button onClick={handleCreateChain} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600" title="New Chain"><Link size={14} /></button>
          </div>"""
    pl_header_new = """<div className="flex items-center gap-1">
              <button onClick={() => setIsCreating(true)} className="p-1.5 bg-[var(--accent-color)] text-white rounded hover:opacity-90" title="New Prompt">+</button>
              <button onClick={() => {
                  const name = prompt("Folder Name:");
                  if(name) addFolder(name);
              }} className="p-1.5 bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] rounded hover:text-[var(--text-primary)]" title="New Folder"><Folder size={14} /></button>
              <button onClick={handleCreateChain} className="p-1.5 bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] rounded hover:text-[var(--text-primary)]" title="New Chain"><Link size={14} /></button>
              <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />
              <button onClick={togglePromptVault} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded hover:bg-[var(--bg-surface-hover)]" title="Close Vault"><Menu size={14} /></button>
          </div>"""
    prompt_list = prompt_list.replace(pl_header_old, pl_header_new)

    with open('src/components/PromptVault/PromptList.tsx', 'w') as f:
        f.write(prompt_list)

print("UI alignments fixed")
