import os

apps_dir = "src/components/Apps"
for file in os.listdir(apps_dir):
    if not file.endswith(".tsx") or file in ["AppLayout.tsx", "AppsPage.tsx"]: continue
    
    filepath = os.path.join(apps_dir, file)
    with open(filepath, "r") as f:
        content = f.read()

    content = content.replace("if (res) if (res)", "if (res)")
    content = content.replace("const res = const res =", "const res =")
    
    with open(filepath, "w") as f:
        f.write(content)

