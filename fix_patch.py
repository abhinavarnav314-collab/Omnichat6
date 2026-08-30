import os
import re

apps_dir = "src/components/Apps"
for file in os.listdir(apps_dir):
    if not file.endswith(".tsx") or file in ["AppLayout.tsx", "AppsPage.tsx"]: continue
    
    filepath = os.path.join(apps_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    # Fix const res = const res = ...
    content = content.replace("const res = const res = ", "const res = ")
    
    # Fix if (res) ... if (res) ...
    content = re.sub(r"(if \(res\) await saveSession\([^;]+;\s*)+", r"if (res) \1", content)
    # wait, re.sub isn't perfect for this, let's just do it directly for the string

    content = re.sub(r"if \(res\) await saveSession\([^;]+\);\s*if \(res\) await saveSession\([^;]+\);", lambda m: m.group(0).split(';')[0] + ';', content)

    with open(filepath, "w") as f:
        f.write(content)

