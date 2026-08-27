import os

path = 'src/store/useAppStore.ts'
with open(path, 'r') as f:
    content = f.read()

replacements = [
    ('autoLockTimeout: 5', "autoLockTimeout: 5,\n  fontSize: 'medium',\n  uiDensity: 'comfortable',\n  parameterPresets: []"),
]

for search, replace in replacements:
    content = content.replace(search, replace)

with open(path, 'w') as f:
    f.write(content)

print("Patched useAppStore.")
