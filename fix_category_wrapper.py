import re

with open("src/components/CategoryManagementView.jsx", "r") as f:
    text = f.read()

# Replace the wrapper classes
text = text.replace('className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs"', 'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"')

with open("src/components/CategoryManagementView.jsx", "w") as f:
    f.write(text)
