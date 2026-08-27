import re

# 1. db.ts schema types
db_ts_path = 'src/services/db.ts'
with open(db_ts_path, 'r') as f:
    db = f.read()
if 'interface OmniDB extends DBSchema' in db:
    db = db.replace('secrets: {', 'abTests: {\n      key: string;\n      value: any;\n    };\n    secrets: {')
    with open(db_ts_path, 'w') as f:
        f.write(db)

# 2. useAppStore.ts UserProfile
app_store_path = 'src/store/useAppStore.ts'
with open(app_store_path, 'r') as f:
    app_store = f.read()
app_store = app_store.replace('import { AppSettings } from \'../types\';', 'import { AppSettings, UserProfile } from \'../types\';')
with open(app_store_path, 'w') as f:
    f.write(app_store)

# 3. SettingsModal.tsx Layout issue
settings_path = 'src/components/Settings/SettingsModal.tsx'
with open(settings_path, 'r') as f:
    settings = f.read()
# The issue was 'Layout' missing. Let's see where Layout is used.
settings = settings.replace('<Layout size={18} />', '<Settings2 size={18} />')
with open(settings_path, 'w') as f:
    f.write(settings)

