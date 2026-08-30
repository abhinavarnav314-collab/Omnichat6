import os
import re

apps_dir = "src/components/Apps"
for file in os.listdir(apps_dir):
    if not file.endswith(".tsx") or file in ["AppLayout.tsx", "AppsPage.tsx"]: continue
    
    filepath = os.path.join(apps_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    # Find where useAppRunner is called
    match = re.search(r"const \{ runPrompt, isRunning(?:, error)? \} = useAppRunner\('[^']+'\);", content)
    if not match:
        continue
    
    # ensure saveSession is extracted
    if 'saveSession' not in match.group(0):
        content = content.replace("runPrompt, isRunning", "runPrompt, saveSession, isRunning")

    # In SEOOptimizer
    if file == "SEOOptimizer.tsx":
        # outline
        content = content.replace(
            "if(res) setStep(2);",
            "if(res) {\n      setStep(2);\n      await saveSession({ topic, keyword }, { outline: res });\n    }"
        )
        # article
        content = content.replace(
            "await runPrompt('You are a world-class SEO copywriter. Format output in Markdown.', prompt, setArticle);",
            "const res = await runPrompt('You are a world-class SEO copywriter. Format output in Markdown.', prompt, setArticle);\n    if (res) await saveSession({ topic, keyword, outline }, { article: res });"
        )
    else:
        # standard apps
        # Need to find the state variables for inputs
        # e.g., const [topic, setTopic] = useState(''); -> topic
        inputs = re.findall(r"const \[(\w+),\s*set\w+\]\s*=\s*useState", content)
        # result is always one of them, we exclude 'result', 'step', etc.
        inputs = [i for i in inputs if i not in ['result', 'step']]
        input_obj = ", ".join(inputs)
        
        # Patch handleRun
        content = re.sub(
            r"(const res = await runPrompt\([^;]+;)",
            r"\1\n    if (res) await saveSession({ " + input_obj + r" }, { result: res });",
            content
        )
        content = re.sub(
            r"(await runPrompt\([^;]+;)",
            r"const res = \1\n    if (res) await saveSession({ " + input_obj + r" }, { result: res });",
            content
        )

    with open(filepath, "w") as f:
        f.write(content)

print("Sessions patched")
