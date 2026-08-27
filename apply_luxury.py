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

# 1. index.html - Add Inter font
html_path = 'index.html'
html = read_file(html_path)
if 'fonts.googleapis.com/css2?family=Inter' not in html:
    html = html.replace('</head>', '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n  </head>')
    write_file(html_path, html)

# 2. src/index.css - Total Luxury Overhaul
css_path = 'src/index.css'
css = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-base: #FAFAF8;
    --bg-surface: #FFFFFF;
    --bg-surface-hover: #F3F4F6;
    --border-subtle: #E5E5E5;
    --text-primary: #1A1A1A;
    --text-secondary: #6B7280;
    --accent-color: #4F46E5;
    
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);
    
    --radius-card: 12px;
    --radius-input: 8px;
    --radius-pill: 999px;

    --density-multiplier: 1;
    --density-p: calc(1.5rem * var(--density-multiplier));
    --density-gap: calc(1rem * var(--density-multiplier));
  }
  
  .dark {
    --bg-base: #0A0A0A;
    --bg-surface: #111111;
    --bg-surface-hover: #1A1A1A;
    --border-subtle: #2A2A2A;
    --text-primary: #F5F5F5;
    --text-secondary: #A1A1AA;
    
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.4);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.5);
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background-color: var(--bg-base);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    letter-spacing: normal;
  }

  h1, h2, h3, h4, h5, h6 {
    letter-spacing: -0.01em;
  }
}

@layer utilities {
  .glass-panel {
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  .dark .glass-panel {
    background-color: rgba(17, 17, 17, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .luxury-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-sm);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .luxury-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .luxury-input {
    background-color: transparent;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-input);
    transition: all 0.2s ease;
  }
  .luxury-input:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    outline: none;
  }

  .luxury-button-primary {
    background: linear-gradient(135deg, var(--accent-color), #4338CA);
    color: white;
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .luxury-button-primary:hover {
    box-shadow: var(--shadow-md);
    transform: scale(0.98);
  }
  .luxury-button-primary:active {
    transform: scale(0.95);
  }
  
  .luxury-button-ghost {
    border-radius: var(--radius-input);
    transition: all 0.2s ease;
  }
  .luxury-button-ghost:hover {
    background-color: var(--bg-surface-hover);
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border-subtle);
    border-radius: 999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
}

/* Markdown prose overrides */
.prose {
  color: var(--text-primary);
  line-height: 1.7;
}
.prose h1, .prose h2, .prose h3 {
  color: var(--text-primary);
  font-weight: 600;
}
.prose code {
  color: var(--text-primary);
  background-color: var(--bg-surface-hover);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
}
.prose pre code {
  background-color: transparent;
  padding: 0;
}
"""
write_file(css_path, css)

# 3. Component Updates - Mass Replacements
def replace_in_file(path, replacements):
    c = read_file(path)
    if not c: return
    for old, new in replacements:
        c = c.replace(old, new)
    write_file(path, c)

def regex_replace_in_file(path, replacements):
    c = read_file(path)
    if not c: return
    for pattern, new in replacements:
        c = re.sub(pattern, new, c)
    write_file(path, c)

# App.tsx
replace_in_file('src/App.tsx', [
    ('bg-white dark:bg-slate-900', 'bg-[var(--bg-base)]'),
    ('text-slate-800 dark:text-slate-200', 'text-[var(--text-primary)]'),
    ('bg-slate-50 dark:bg-slate-900 border-r dark:border-slate-800', 'bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]'),
    ('border-b dark:border-slate-800', 'border-b border-[var(--border-subtle)]'),
    ('border-t dark:border-slate-800', 'border-t border-[var(--border-subtle)]'),
    ('text-[var(--accent-color)] dark:text-blue-400', 'text-[var(--accent-color)]'),
    ('bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color)] transition-colors shadow-sm', 'luxury-button-primary'),
    ('hover:bg-slate-100 dark:hover:bg-slate-800', 'luxury-button-ghost'),
    ('bg-white dark:bg-slate-800 border dark:border-slate-700', 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-card'),
    ('text-slate-600 dark:text-slate-400', 'text-[var(--text-secondary)]'),
    ('text-slate-500', 'text-[var(--text-secondary)]'),
])

# ChatWindow.tsx
replace_in_file('src/components/Chat/ChatWindow.tsx', [
    ('bg-white dark:bg-slate-900', 'bg-[var(--bg-base)]'),
    ('border-b dark:border-slate-800', 'border-b border-[var(--border-subtle)]'),
    ('bg-white/80 dark:bg-slate-900/80 backdrop-blur', 'glass-panel'),
    ('border-t dark:border-slate-800', 'border-t border-[var(--border-subtle)]'),
    ('text-slate-800 dark:text-slate-200', 'text-[var(--text-primary)]'),
    ('hover:bg-slate-100 dark:hover:bg-slate-800', 'luxury-button-ghost'),
    ('bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200', 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]'),
])

# MessageInput.tsx
replace_in_file('src/components/Chat/MessageInput.tsx', [
    ('bg-white dark:bg-slate-800 border dark:border-slate-700', 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] luxury-input'),
    ('text-slate-800 dark:text-slate-200', 'text-[var(--text-primary)]'),
    ('text-slate-400 dark:text-slate-500', 'text-[var(--text-secondary)]'),
    ('bg-[var(--accent-color)] text-white hover:bg-blue-600', 'luxury-button-primary'),
    ('hover:bg-slate-100 dark:hover:bg-slate-700', 'luxury-button-ghost'),
    ('shadow-sm', 'shadow-[var(--shadow-sm)]'),
])

# MessageList.tsx
replace_in_file('src/components/Chat/MessageList.tsx', [
    ('bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700', 'luxury-card'),
    ('bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50', 'bg-[var(--bg-surface-hover)] border-[var(--border-subtle)]'),
    ('text-slate-800 dark:text-slate-200', 'text-[var(--text-primary)]'),
    ('text-slate-500 dark:text-slate-400', 'text-[var(--text-secondary)]'),
    ('hover:bg-slate-100 dark:hover:bg-slate-700', 'luxury-button-ghost'),
    ('bg-[#1E1E1E] border border-slate-700/50', 'bg-[#111111] border border-[#2A2A2A]'), # Darker code blocks
    ('bg-slate-800/50 border-b border-slate-700/50', 'bg-[#0A0A0A] border-b border-[#2A2A2A]'),
])

# Modal.tsx
replace_in_file('src/components/Shared/Modal.tsx', [
    ('bg-black/50', 'bg-black/40 backdrop-blur-sm'),
    ('bg-white dark:bg-slate-900', 'bg-[var(--bg-surface)]'),
    ('border dark:border-slate-700', 'border border-[var(--border-subtle)]'),
    ('text-slate-800 dark:text-slate-200', 'text-[var(--text-primary)]'),
    ('text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200', 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] luxury-button-ghost'),
])

# SettingsModal.tsx
replace_in_file('src/components/Settings/SettingsModal.tsx', [
    ('border-b dark:border-slate-700', 'border-b border-[var(--border-subtle)]'),
    ('hover:bg-slate-100 dark:hover:bg-slate-800', 'luxury-button-ghost'),
    ('bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]'),
    ('border dark:border-slate-600 bg-white dark:bg-slate-800', 'luxury-input bg-[var(--bg-surface)] text-[var(--text-primary)]'),
])

print("Luxury styling applied to core components.")

