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

apimanager_path = 'src/components/Settings/ApiKeyManager.tsx'
apim_c = read_file(apimanager_path)

if 'Test Connection' not in apim_c and apim_c:
    # We will just append a basic Test Connection feature if it's feasible, but since we don't have the exact content, let's just create a completely robust version of ApiKeyManager.
    # Actually, let's just read it first to see how it's structured.
    pass

