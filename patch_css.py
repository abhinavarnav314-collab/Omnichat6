css_path = 'src/index.css'
with open(css_path, 'r') as f:
    css_c = f.read()

css_c = css_c.replace(
"""@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  .dark {""", 
"""@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --accent-color: #3b82f6;
    --density-multiplier: 1;
    --density-p: calc(1rem * var(--density-multiplier));
    --density-gap: calc(1rem * var(--density-multiplier));
  }
  .dark {""")
with open(css_path, 'w') as f:
    f.write(css_c)
print("css fixed")
