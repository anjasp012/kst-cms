import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# Top buttons
old_top_buttons = """        <div className="flex items-center gap-2">
          <Button
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
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Simpan</span>
          </Button>
        </div>"""

new_top_buttons = """        <div className="flex items-center gap-2">
          <Button
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
            disabled={saving}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Simpan</span>
          </Button>
        </div>"""
text = text.replace(old_top_buttons, new_top_buttons)

# Bottom buttons
old_bot_buttons = """        <div className="flex items-center gap-2">
          <Button
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
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            className="h-9 px-6 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{isEdit ? 'Simpan' : 'Simpan'}</span>
          </Button>
        </div>"""

new_bot_buttons = """        <div className="flex items-center gap-2">
          <Button
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
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="h-9 px-4 text-xs text-blue-600 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Simpan Draft</span>
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            className="h-9 px-6 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Simpan</span>
          </Button>
        </div>"""
text = text.replace(old_bot_buttons, new_bot_buttons)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
