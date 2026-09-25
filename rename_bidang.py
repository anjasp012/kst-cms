import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

text = text.replace("Bidang Riset", "Tema Riset")
text = text.replace("bidang riset", "tema riset")
text = text.replace("Bidang riset", "Tema riset")
text = text.replace("BIDANG RISET", "TEMA RISET")
text = text.replace("highlight_bidang_riset", "highlight_tema_riset")
text = text.replace("defaultBidang", "defaultTema")
text = text.replace("r.bidang", "r.tema")
text = text.replace('bidang:', 'tema:')

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
