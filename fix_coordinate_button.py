import re

with open("src/components/ui/CoordinatePicker.jsx", "r") as f:
    text = f.read()

old_btn = """          <Button
            type="submit"
            variant="secondary"
            disabled={searching}
            className="h-8 text-xs px-3"
          >"""

new_btn = """          <Button
            type="button"
            onClick={handleSearch}
            variant="secondary"
            disabled={searching}
            className="h-8 text-xs px-3"
          >"""

text = text.replace(old_btn, new_btn)

with open("src/components/ui/CoordinatePicker.jsx", "w") as f:
    f.write(text)
