import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Replace Top Buttons
top_pattern = r'<Button\s*type="button"\s*variant="outline"\s*size="sm"\s*onClick=\{\(\) => navigate\(\'/kst\'\)\}.*?Batal\s*</Button>\s*<Button\s*type="submit"\s*size="sm"\s*disabled=\{saving\}\s*className="h-8 text-xs font-medium gap-1\.5"\s*>\s*\{saving \? <Loader2 className="w-3\.5 h-3\.5 animate-spin" /> : <Save className="w-3\.5 h-3\.5" />\}\s*<span>Simpan</span>\s*</Button>'

new_top = """<Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/kst')}
            className="h-8 text-xs font-mono"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="h-8 text-xs text-blue-600 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Simpan Draft</span>
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            size="sm"
            disabled={saving}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Simpan</span>
          </Button>"""

text = re.sub(top_pattern, new_top, text, flags=re.DOTALL)

# Replace Bottom Buttons
bot_pattern = r'<Button\s*type="button"\s*variant="outline"\s*size="sm"\s*onClick=\{\(\) => navigate\(\'/kst\'\)\}\s*className="h-8 text-xs font-mono"\s*>\s*Batal\s*</Button>\s*<Button\s*type="submit"\s*size="sm"\s*disabled=\{saving\}\s*className="h-8 text-xs font-medium gap-1\.5"\s*>\s*\{saving && <Loader2 className="w-3\.5 h-3\.5 animate-spin" />\}\s*<span>\{isEdit \? \'Simpan\' : \'Simpan\'\}</span>\s*</Button>'

new_bot = """<Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/kst')}
            className="h-8 text-xs font-mono"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="h-8 text-xs text-blue-600 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Simpan Draft</span>
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            size="sm"
            disabled={saving}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Simpan</span>
          </Button>"""

text = re.sub(bot_pattern, new_bot, text, flags=re.DOTALL)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
