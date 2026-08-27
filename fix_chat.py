import re

with open('src/components/Chat/ChatWindow.tsx', 'r') as f:
    c = f.read()

replacement = """  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative">
      <div className="h-14 border-b dark:border-slate-800 flex items-center justify-between px-4 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur z-10">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-4">
          {activeConvo.title}
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleToggleCompare}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${activeConvo.isComparison ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Start comparison chat"
          >
            <Columns size={16} /> Compare
          </button>
          <ModelSelector isComparison={activeConvo.isComparison} />
          <button 
            onClick={() => setShowInsights(!showInsights)} 
            className={`p-2 rounded-lg hidden xl:flex items-center gap-2 text-sm font-medium transition-colors ${showInsights ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Toggle Insights"
          >
            <PieChart size={16}/>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden relative">
            <MessageList 
              conversation={activeConvo} 
              isComparison={activeConvo.isComparison} 
              onResend={(content, parentId) => handleSendMessage(content, parentId)}
            />
          </div>
          <div className="shrink-0 p-[var(--density-p)] z-10 glass-panel border-t dark:border-slate-800">
            <MessageInput 
              onSend={handleSendMessage} 
              isGenerating={isGenerating} 
              onStop={stopGenerating}
            />
          </div>
        </div>
        {showInsights && <ConversationInsights conversation={activeConvo} />}
      </div>
    </div>
  );
}"""

c = re.sub(r'  return \(.*?\}\n', replacement, c, flags=re.DOTALL)
with open('src/components/Chat/ChatWindow.tsx', 'w') as f:
    f.write(c)

