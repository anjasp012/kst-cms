import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = text.replace("import { request, API_BASE, useState, useEffect } from 'react'", "import { useState, useEffect } from 'react'")
text = text.replace("import { \n  uploadFile", "import { request, API_BASE, \n  uploadFile")

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
