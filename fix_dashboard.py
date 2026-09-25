with open("src/components/Dashboard.jsx", "r") as f:
    text = f.read()

import re

# Remove partner api functions
text = re.sub(r'fetchRegionalPartners,\n\s*createRegionalPartner,\n\s*updateRegionalPartner,\n\s*deleteRegionalPartner,\n', '', text)

# Remove partners state
text = re.sub(r'\s*const \[partners, setPartners\] = useState\(\[\]\)\n', '\n', text)

# Update loadData Promise.all
text = re.sub(r'partnersRes,\s*', '', text)
text = re.sub(r'fetchRegionalPartners\(\)\.catch\(\(\) => \[\]\),\s*', '', text)
text = re.sub(r'if \(Array\.isArray\(partnersRes\)\) setPartners\(partnersRes\)\n', '', text)

# Remove partner handlers
text = re.sub(r'// --- PARTNERS CRUD HANDLERS ---.*?// --- KST & DASHBOARD MASTER DATA TABS ---', '// --- KST & DASHBOARD MASTER DATA TABS ---', text, flags=re.DOTALL)

# Remove count + partners.length
text = re.sub(r'count: kstLocations\.length \+ partners\.length,', 'count: kstLocations.length,', text)

# Update KSTManagementView usage
text = re.sub(r'partners=\{partners\}.*?onDeletePartner=\{handleDeletePartner\}', '', text, flags=re.DOTALL)

with open("src/components/Dashboard.jsx", "w") as f:
    f.write(text)
