import os
import re

apps_dir = "src/components/Apps"
for file in os.listdir(apps_dir):
    if not file.endswith(".tsx") or file in ["AppLayout.tsx", "AppsPage.tsx", "useAppRunner.ts"]: continue
    
    filepath = os.path.join(apps_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    # extract appId from useAppRunner('...')
    match = re.search(r"useAppRunner\('([^']+)'\)", content)
    appId = match.group(1) if match else "unknown"

    # Add appId to AppLayout
    content = content.replace("<AppLayout title=", f"<AppLayout appId=\"{appId}\" title=")
    
    with open(filepath, "w") as f:
        f.write(content)

