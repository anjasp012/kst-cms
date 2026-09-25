with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Delete Fokus Utama
start1 = text.find('            <div className="space-y-2">\n              <div className="flex items-center justify-between">\n                <Label className="text-xs font-semibold">Tema Riset (Fokus Utama)</Label>')
end1 = text.find('            <div className="space-y-1.5">\n              <Label className="text-xs font-semibold">Terhubung Dengan</Label>', start1)
if start1 != -1 and end1 != -1:
    text = text[:start1] + text[end1:]

# Delete Terhubung Dengan
start2 = text.find('            <div className="space-y-1.5">\n              <Label className="text-xs font-semibold">Terhubung Dengan</Label>')
end2 = text.find('          </div>\n        </Card>', start2)
if start2 != -1 and end2 != -1:
    text = text[:start2] + text[end2:]

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
print("Done")
