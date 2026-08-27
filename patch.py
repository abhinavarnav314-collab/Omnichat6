import os
import re
import json

def patch_file(path, replacements):
    with open(path, 'r') as f:
        content = f.read()
    for search, replace in replacements:
        if search not in content and not hasattr(search, 'pattern'):
            print(f"Warning: could not find {search} in {path}")
        if hasattr(search, 'pattern'):
            content = search.sub(replace, content)
        else:
            content = content.replace(search, replace)
    with open(path, 'w') as f:
        f.write(content)

# src/types/index.ts
patch_file('src/types/index.ts', [
    ('cost?: number;', 'cost?: number;\n  pinned?: boolean;\n  reaction?: \'up\' | \'down\' | null;'),
    ('systemPrompt?: string;', 'systemPrompt?: string;\n  pinned?: boolean;\n  tags?: string[];'),
    ('folderId?: string | null;', 'folderId?: string | null;\n  isTemplate?: boolean;'),
    ('autoLockTimeout?: number;', 'autoLockTimeout?: number;\n  fontSize?: \'small\' | \'medium\' | \'large\';\n  uiDensity?: \'comfortable\' | \'compact\';\n  parameterPresets?: Array<{name: string; temperature?: number; top_p?: number; max_tokens?: number}>;'),
])

print("Patched types.")
