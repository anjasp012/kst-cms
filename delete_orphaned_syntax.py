import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

# I will find this specific block and replace it with just ''
orphaned_block = """

      if (isEdit) {
        await updateKST(id, payload)
        toast.success('Data KST berhasil diperbarui')
      } else {
        await createKST(payload)
        toast.success('KST baru berhasil ditambahkan')
      }

      if (onSaveSuccess) onSaveSuccess()
      navigate('/kst')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data KST')
    } finally {
      setSaving(false)
    }
  }"""

if orphaned_block in text:
    text = text.replace(orphaned_block, "")
    with open("src/components/KSTFormPage.jsx", "w") as f:
        f.write(text)
    print("Deleted successfully")
else:
    print("Block not found!")
