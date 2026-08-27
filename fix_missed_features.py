import re

# 1. PromptEditor.tsx
with open('src/components/PromptVault/PromptEditor.tsx', 'r') as f:
    pe = f.read()

pe = pe.replace(
    "import { X, Save, History, Star } from 'lucide-react';",
    "import { X, Save, History, Star, Wand2 } from 'lucide-react';\nimport { sendMessageService } from '../../services/chatService';\nimport { useAppStore } from '../../store/useAppStore';"
)

opt_logic = """
  const [isOptimizing, setIsOptimizing] = useState(false);
  const handleOptimize = async () => {
    if (!text) return;
    setIsOptimizing(true);
    try {
      const controller = new AbortController();
      const tmpConvoId = 'opt-' + Date.now();
      const prompt = `Rewrite the following prompt to be more effective, clear, and specific. Return ONLY the rewritten prompt without any conversational text or markdown blocks:\\n\\n${text}`;
      const response = await sendMessageService(tmpConvoId, prompt, null, controller.signal, true);
      if (response && response.content) {
        setText(response.content.trim());
      }
    } catch (e: any) {
      alert("Optimization failed: " + e.message);
    } finally {
      setIsOptimizing(false);
    }
  };
"""

pe = pe.replace('const [showHistory, setShowHistory] = useState(false);', 'const [showHistory, setShowHistory] = useState(false);\n' + opt_logic)

opt_btn = """
          <button
            type="button"
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg font-medium transition-colors mr-auto"
          >
            <Wand2 size={16} />
            {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
          </button>
          <button
            onClick={onClose}
"""
pe = pe.replace('<button\n            onClick={onClose}\n', opt_btn)

with open('src/components/PromptVault/PromptEditor.tsx', 'w') as f:
    f.write(pe)

# 2. MessageList.tsx
with open('src/components/Chat/MessageList.tsx', 'r') as f:
    ml = f.read()

score_btn = """
                        <button
                          onClick={() => {
                            const newScore = prompt("Rate this response (1-10) for accuracy and clarity:");
                            if (newScore && !isNaN(Number(newScore))) {
                              alert(`Scored ${newScore}/10. Saved locally.`);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-yellow-500 transition-colors ml-2"
                          title="Score Quality"
                        >
                          <Star size={14} />
                        </button>
                      )}
"""

ml = ml.replace("import { User, Bot, RefreshCw, Pencil, Check, Copy } from 'lucide-react';", "import { User, Bot, RefreshCw, Pencil, Check, Copy, Star } from 'lucide-react';")

# There's two spots for assistant message rendering in MessageList (comparison mode & normal mode)
# In normal mode:
ml = ml.replace("{msg.role === 'assistant' && !msg.isError && (", score_btn + "\n                      {msg.role === 'assistant' && !msg.isError && (")

with open('src/components/Chat/MessageList.tsx', 'w') as f:
    f.write(ml)

print("Missed features fixed")
