path = 'src/store/useChatStore.ts'
with open(path, 'r') as f:
    content = f.read()

search = 'updateMessage: (convoId: string, messageId: string, updates: Partial<Message>, skipSave?: boolean) => Promise<void>;'
replace = search + '\n  deleteMessage: (convoId: string, messageId: string) => Promise<void>;\n  pinConversation: (convoId: string, pinned: boolean) => Promise<void>;\n  updateConversationTags: (convoId: string, tags: string[]) => Promise<void>;'
content = content.replace(search, replace)

search2 = 'deleteConversation: async (id) => {'
replace2 = '''  deleteMessage: async (convoId, messageId) => {
    const { conversations } = get();
    const idx = conversations.findIndex(c => c.id === convoId);
    if (idx === -1) return;
    const convo = { ...conversations[idx] };
    
    // Find all descendants
    const msgsToDelete = new Set([messageId]);
    let added = true;
    while(added) {
        added = false;
        for (const m of convo.messages) {
            if (m.parentId && msgsToDelete.has(m.parentId) && !msgsToDelete.has(m.id)) {
                msgsToDelete.add(m.id);
                added = true;
            }
        }
    }
    
    convo.messages = convo.messages.filter(m => !msgsToDelete.has(m.id));
    convo.updatedAt = Date.now();
    
    // Update leaf
    if (msgsToDelete.has(convo.currentLeafId || '')) {
       convo.currentLeafId = convo.messages.length > 0 ? convo.messages[convo.messages.length - 1].id : undefined;
    }
    
    await saveConversation(convo);
    const newConvos = [...conversations];
    newConvos[idx] = convo;
    set({ conversations: newConvos });
  },
  pinConversation: async (convoId, pinned) => {
    const { conversations } = get();
    const idx = conversations.findIndex(c => c.id === convoId);
    if (idx === -1) return;
    const convo = { ...conversations[idx], pinned, updatedAt: Date.now() };
    await saveConversation(convo);
    const newConvos = [...conversations];
    newConvos[idx] = convo;
    set({ conversations: newConvos });
  },
  updateConversationTags: async (convoId, tags) => {
    const { conversations } = get();
    const idx = conversations.findIndex(c => c.id === convoId);
    if (idx === -1) return;
    const convo = { ...conversations[idx], tags, updatedAt: Date.now() };
    await saveConversation(convo);
    const newConvos = [...conversations];
    newConvos[idx] = convo;
    set({ conversations: newConvos });
  },
  deleteConversation: async (id) => {'''

content = content.replace(search2, replace2)

with open(path, 'w') as f:
    f.write(content)
print("Patched chatStore.")
