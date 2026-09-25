import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Replace the specific block of two divs
target = """            </div>
          </div>

          </div>"""

replacement = """            </div>
          </div>"""

text = text.replace(target, replacement)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
