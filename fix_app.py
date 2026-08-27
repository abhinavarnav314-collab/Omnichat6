import re

with open('src/App.tsx', 'r') as f:
    app_tsx = f.read()

# Replace toggle buttons block
toggle_pattern = r'\{\/\* Toggle Buttons \*\/\}.*?<button.*?onClick=\{toggleSidebar\}.*?</button>.*?<button.*?onClick=\{togglePromptVault\}.*?</button>'
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

app_tsx = re.sub(toggle_pattern, toggle_new, app_tsx, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(app_tsx)

