import re

db_ts_path = 'src/services/db.ts'
with open(db_ts_path, 'r') as f:
    db = f.read()
if 'interface OmniChatDB extends DBSchema' in db:
    db = db.replace('secrets: {', 'abTests: {\n    key: string;\n    value: any;\n  };\n  secrets: {')
    with open(db_ts_path, 'w') as f:
        f.write(db)

settings_path = 'src/components/Settings/SettingsModal.tsx'
with open(settings_path, 'r') as f:
    settings = f.read()
settings = settings.replace('<Layout size={18} />', '<Settings2 size={18} />')
with open(settings_path, 'w') as f:
    f.write(settings)

