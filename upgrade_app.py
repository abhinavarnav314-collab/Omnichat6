import re

# 1. Update useAppStore.ts
with open('src/store/useAppStore.ts', 'r') as f:
    app_store = f.read()

app_store = app_store.replace('isSidebarOpen: boolean;', 'isSidebarOpen: boolean;\n  currentView: \'chat\' | \'apps\';\n  setCurrentView: (view: \'chat\' | \'apps\') => void;')
app_store = app_store.replace('isSidebarOpen: true,\n    isPromptVaultOpen: false,', 'isSidebarOpen: true,\n    isPromptVaultOpen: false,\n    currentView: \'chat\',\n    setCurrentView: (view) => set({ currentView: view }),')

with open('src/store/useAppStore.ts', 'w') as f:
    f.write(app_store)

# 2. Update App.tsx
with open('src/App.tsx', 'r') as f:
    app_tsx = f.read()

app_tsx = app_tsx.replace("import ChatWindow from './components/Chat/ChatWindow';", "import ChatWindow from './components/Chat/ChatWindow';\nimport AppsPage from './components/Apps/AppsPage';\nimport { LayoutGrid } from 'lucide-react';")

app_tsx = app_tsx.replace('togglePromptVault,\n  } = useAppStore();', 'togglePromptVault,\n    currentView,\n    setCurrentView,\n  } = useAppStore();')

sidebar_apps_btn = """        <div className="p-4 shrink-0 space-y-2">
          <button
            onClick={() => { setCurrentView('chat'); createConversation(); }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-medium transition-all ${currentView === 'chat' ? 'luxury-button-primary' : 'luxury-button-ghost'}`}
          >
            <Plus size={18} /> New Chat
          </button>
          <button
            onClick={() => setCurrentView('apps')}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-medium transition-all ${currentView === 'apps' ? 'luxury-button-primary' : 'luxury-button-ghost'}`}
          >
            <LayoutGrid size={18} /> Premium Apps
          </button>
        </div>"""
app_tsx = re.sub(r'<div className="p-4 shrink-0 space-y-2">.*?</div>', sidebar_apps_btn, app_tsx, flags=re.DOTALL)

app_tsx = app_tsx.replace('onClick={() => setActiveId(convo.id)}', 'onClick={() => { setActiveId(convo.id); setCurrentView(\'chat\'); }}')

app_tsx = app_tsx.replace('<ChatWindow />', '{currentView === \'apps\' ? <AppsPage /> : <ChatWindow />}')

with open('src/App.tsx', 'w') as f:
    f.write(app_tsx)

print("App routing updated")
