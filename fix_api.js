const fs = require('fs')

let text = fs.readFileSync('src/lib/api.js', 'utf8')

const regex = /export async function fetchProvinces\(\) \{\n  return request\(`\$\{API_BASE\}\/kst\/wilayah\/provinces`\);\n\}` : '';\n  return request\(`\$\{API_BASE\}\/kst\/wilayah\/provinces\$\{qs\}`\);\n\}/
const replacement = `export async function fetchProvinces() {
  return request(\`\${API_BASE}/kst/wilayah/provinces\`);
}`

text = text.replace(regex, replacement)
fs.writeFileSync('src/lib/api.js', text)
