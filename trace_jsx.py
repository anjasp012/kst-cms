with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

start = text.find("{/* TAB 1: SPASIAL & INFORMASI UMUM */}")
end = text.find("{/* TAB 2: PROFIL & FOKUS */}")

tab1 = text[start:end]

lines = tab1.split('\n')
div_count = 0
for i, line in enumerate(lines):
    div_count += line.count('<div')
    div_count -= line.count('</div')
    if "<Card" in line: div_count += 1
    if "</Card" in line: div_count -= 1
    
    print(f"{i}: {div_count} | {line.strip()}")
