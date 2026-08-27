import re

def rewrite(path, s, r):
    with open(path, 'r') as f:
        c = f.read()
    with open(path, 'w') as f:
        f.write(c.replace(s, r))

# crypto
rewrite('src/services/crypto.ts', "if (plaintext && plaintext.startsWith('sk-') && !passphrase)", "if (plaintext && typeof plaintext === 'string' && plaintext.trim().length > 0 && !passphrase)")

# html
rewrite('index.html', " frame-ancestors 'none';", "")

# App.tsx shortcuts and totalCost and settings
import os
app_path = 'src/App.tsx'
with open(app_path, 'r') as f:
    app_c = f.read()

# Fix totalCost
app_c = app_c.replace(
    "const totalCost = conversations.reduce((acc, c) => acc + c.messages.reduce((mc, m) => mc + (m.cost || 0), 0), 0);",
    """const totalCost = useMemo(() => {
      return conversations.reduce((acc, c) => acc + c.messages.reduce((mc, m) => mc + (m.cost || 0), 0), 0);
  }, [conversations]);"""
)
# Add useMemo import if missing
if 'useMemo' not in app_c.split(';')[0]:
    app_c = app_c.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState, useMemo } from 'react';")

# Fix settings apply
settings_apply = """  useEffect(() => {
      document.documentElement.style.setProperty('--accent-color', settings.accentColor || '#2563eb');
      
      let fontSize = '16px';
      if (settings.fontSize === 'small') fontSize = '14px';
      if (settings.fontSize === 'large') fontSize = '18px';
      document.documentElement.style.fontSize = fontSize;
      
      if (settings.uiDensity === 'compact') {
          document.documentElement.style.setProperty('--density-multiplier', '0.5');
      } else {
          document.documentElement.style.setProperty('--density-multiplier', '1');
      }
  }, [settings.accentColor, settings.uiDensity, settings.fontSize]);"""
app_c = re.sub(r"  useEffect\(\(\) => \{\n      document\.documentElement\.style\.setProperty\('--accent-color', settings\.accentColor \|\| '#2563eb'\);\n  \}, \[settings\.accentColor\]\);", settings_apply, app_c)

# Fix keyboard shortcuts
mac_shortcuts = """      const isModifierPressed = (e: KeyboardEvent) => e.ctrlKey || e.metaKey;
      
      const handleKeyDown = (e: KeyboardEvent) => {
          if (isModifierPressed(e) && e.shiftKey && e.key.toLowerCase() === 'p') {
              e.preventDefault();
              setShowCommandPalette(true);
          } else if (isModifierPressed(e) && e.key === '/') {
              e.preventDefault();
              togglePromptVault();
          } else if (isModifierPressed(e) && e.key.toLowerCase() === 'n') {
              e.preventDefault();
              createConversation();
          }
      };"""
app_c = re.sub(r"      const handleKeyDown = \(e: KeyboardEvent\) => \{.*?createConversation\(\);\n          \}\n      \};", mac_shortcuts, app_c, flags=re.DOTALL)

# Add style tag
app_c = app_c.replace('<div className="flex h-screen w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden text-sm">', '<div className="flex h-screen w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden text-sm" style={{ padding: \'var(--density-p, 0px)\', gap: \'var(--density-gap, 0px)\' }}>')

with open(app_path, 'w') as f:
    f.write(app_c)


css_path = 'src/index.css'
with open(css_path, 'r') as f:
    css_c = f.read()

css_c = css_c.replace(
"""@layer base {
  :root {
    --accent-color: #3b82f6;
  }
}""", 
"""@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --accent-color: #3b82f6;
    --density-multiplier: 1;
    --density-p: calc(1rem * var(--density-multiplier));
    --density-gap: calc(1rem * var(--density-multiplier));
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}""")
with open(css_path, 'w') as f:
    f.write(css_c)

print("done")
