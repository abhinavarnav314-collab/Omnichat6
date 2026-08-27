import os
import glob
import re

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # Generic Tailwind class replacements
    replacements = [
        # Backgrounds
        (r'bg-white dark:bg-slate-900', 'bg-[var(--bg-base)]'),
        (r'bg-slate-50 dark:bg-slate-900', 'bg-[var(--bg-base)]'),
        (r'bg-white dark:bg-slate-800', 'bg-[var(--bg-surface)] luxury-card'),
        (r'bg-white/80 dark:bg-slate-900/80', 'glass-panel'),
        
        # Text
        (r'text-slate-800 dark:text-slate-200', 'text-[var(--text-primary)]'),
        (r'text-slate-900 dark:text-white', 'text-[var(--text-primary)]'),
        (r'text-slate-600 dark:text-slate-400', 'text-[var(--text-secondary)]'),
        (r'text-slate-500 dark:text-slate-400', 'text-[var(--text-secondary)]'),
        (r'text-slate-500', 'text-[var(--text-secondary)]'),
        (r'text-slate-400', 'text-[var(--text-secondary)]'),
        
        # Borders
        (r'border-slate-200 dark:border-slate-700', 'border-[var(--border-subtle)]'),
        (r'border-slate-200 dark:border-slate-800', 'border-[var(--border-subtle)]'),
        (r'dark:border-slate-800', 'border-[var(--border-subtle)]'),
        (r'dark:border-slate-700', 'border-[var(--border-subtle)]'),
        
        # Accents & Interactions
        (r'hover:bg-slate-100 dark:hover:bg-slate-800', 'luxury-button-ghost'),
        (r'hover:bg-slate-100 dark:hover:bg-slate-700', 'luxury-button-ghost'),
        (r'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]'),
        (r'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200', 'bg-[var(--bg-surface-hover)] text-[var(--accent-color)]'),
        
        # Buttons
        (r'bg-blue-600 hover:bg-blue-700 text-white', 'luxury-button-primary'),
        (r'bg-\[var\(--accent-color\)\] text-white hover:bg-blue-600', 'luxury-button-primary'),
    ]

    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)
    
    # Fix potential double-classes from the naive replacement
    new_content = new_content.replace('border border-[var(--border-subtle)] border-[var(--border-subtle)]', 'border border-[var(--border-subtle)]')
    new_content = new_content.replace('bg-[var(--bg-surface)] luxury-card luxury-card', 'bg-[var(--bg-surface)] luxury-card')
    new_content = new_content.replace('luxury-button-ghost luxury-button-ghost', 'luxury-button-ghost')
    
    if new_content != content:
        with open(path, 'w') as f:
            f.write(new_content)
        print(f"Updated {path}")

# Iterate over all tsx files
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

