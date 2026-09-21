/**
 * Export research suggestions to Microsoft Excel (.xls) with custom HTML table formatting.
 */
export function exportSuggestionsToExcel(data, customTitle = 'Daftar Usulan Riset Pengunjung') {
  const now = new Date()
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const rowsHtml = data
    .map((item, index) => {
      const itemDate = new Date(item.created_at)
      const tgl = !isNaN(itemDate)
        ? itemDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-'
      const jam = !isNaN(itemDate)
        ? `${itemDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
        : '-'

      const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'

      const safeTopic = (item.topic_wanted || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br/>')

      const safeFeedback = item.feedback
        ? `<div style="font-size: 9pt; color: #64748B; font-style: italic; margin-top: 4px;">Feedback: "${item.feedback
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}"</div>`
        : ''

      return `
        <tr style="background-color: ${rowBg};">
          <td style="border: 1px solid #CBD5E1; padding: 10px 8px; text-align: center; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #475569;">
            ${index + 1}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 14px; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #0F172A; line-height: 1.4; text-align: left;">
            <strong>${safeTopic}</strong>
            ${safeFeedback}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${item.visitor_name || 'Anonim'} ${item.age_range ? `(${item.age_range})` : ''}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${item.persona_name || '-'}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 10pt; color: #334155; text-align: left;">
            ${item.zone_name || '-'}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #475569; text-align: center; white-space: nowrap;">
            ${tgl}
          </td>
          <td style="border: 1px solid #CBD5E1; padding: 10px 10px; font-family: 'Segoe UI', Calibri, Arial; font-size: 11pt; color: #475569; text-align: center; white-space: nowrap;">
            ${jam}
          </td>
        </tr>
      `
    })
    .join('')

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Usulan Riset Pengunjung</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Print>
                  <x:ValidPrinterInfo/>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        .title-banner {
          background-color: #0F172A;
          color: #FFFFFF;
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          padding: 16px;
          border: 1px solid #0F172A;
        }
        .meta-label {
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 10pt;
          font-weight: bold;
          color: #475569;
          background-color: #F1F5F9;
          padding: 6px 10px;
          border: 1px solid #CBD5E1;
        }
        .meta-val {
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 10pt;
          color: #0F172A;
          background-color: #FFFFFF;
          padding: 6px 10px;
          border: 1px solid #CBD5E1;
        }
        .th-header {
          background-color: #1E293B;
          color: #FFFFFF;
          font-family: 'Segoe UI', Calibri, Arial;
          font-size: 11pt;
          font-weight: bold;
          padding: 12px 10px;
          text-align: center;
          border: 1px solid #0F172A;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <th colspan="7" class="title-banner">
            DAFTAR USULAN RISET PENGUNJUNG · RESEARCH TABLE BRIN
          </th>
        </tr>
        <tr>
          <td colspan="7" style="height: 10px;"></td>
        </tr>

        <tr>
          <td class="meta-label">Waktu Unduh:</td>
          <td class="meta-val" colspan="2">${dateFormatted}, ${timeFormatted} WIB</td>
          <td class="meta-label">Total Data:</td>
          <td class="meta-val" colspan="3">${data.length} Baris Usulan</td>
        </tr>
        <tr>
          <td colspan="7" style="height: 12px;"></td>
        </tr>

        <thead>
          <tr>
            <th class="th-header" style="width: 50px;">No</th>
            <th class="th-header" style="width: 380px;">Topik Usulan Riset & Ide Pengunjung</th>
            <th class="th-header" style="width: 180px;">Nama Pengunjung & Usia</th>
            <th class="th-header" style="width: 160px;">Modul Pengguna</th>
            <th class="th-header" style="width: 160px;">Token Tantangan</th>
            <th class="th-header" style="width: 130px;">Tanggal Masuk</th>
            <th class="th-header" style="width: 100px;">Waktu</th>
          </tr>
        </thead>

        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `

  const blob = new Blob(['\uFEFF' + excelTemplate], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileDateStr = now.toISOString().split('T')[0]
  link.href = url
  link.setAttribute('download', `Laporan_Usulan_ResearchTable_${fileDateStr}.xls`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
