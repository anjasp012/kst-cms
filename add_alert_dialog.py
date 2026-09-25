import re

with open("src/components/KSTFormPage.jsx", "r") as f:
    text = f.read()

alert_jsx = """
      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Ada Data yang Belum Diisi</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Beberapa data pendukung masih kosong:
              <ul className="list-disc list-inside mt-2 space-y-1">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
              <br />
              Apakah Anda yakin ingin tetap menyimpan KST ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmModalOpen(false)
                if (pendingPayload) {
                  executeSave(pendingPayload)
                }
              }}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tetap Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>"""

text = text.replace("    </form>", alert_jsx)

with open("src/components/KSTFormPage.jsx", "w") as f:
    f.write(text)
