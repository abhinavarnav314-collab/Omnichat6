import re

app_store_path = 'src/store/useAppStore.ts'
with open(app_store_path, 'r') as f:
    app_store = f.read()

# Fix the duplicate return in updateSettings
app_store = re.sub(r'      return \{\n    activeProfile:.*?addProfile:.*?\}\), settings: updated \};', '      return { settings: updated };', app_store, flags=re.DOTALL)

with open(app_store_path, 'w') as f:
    f.write(app_store)

