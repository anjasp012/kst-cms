import re

with open("src/components/CategoryManagementView.jsx", "r") as f:
    text = f.read()

text = re.sub(r'\s*<div className=\{`p-1\.5 rounded-md \$\{config\.badgeClass\}`\}>\n\s*<Icon className="w-4 h-4" />\n\s*</div>', '', text)
text = re.sub(r'\s*<p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">\n\s*\{config\.description\}\n\s*</p>', '', text)

with open("src/components/CategoryManagementView.jsx", "w") as f:
    f.write(text)
