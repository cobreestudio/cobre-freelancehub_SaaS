import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, Profile } from './types'

const MARGIN = 14
const PAGE_W = 210
const RIGHT = PAGE_W - MARGIN
const COL2 = 110

export function generateInvoicePDF(invoice: Invoice, invoiceNumber: string, profile?: Profile | null) {
  const doc = new jsPDF()

  const issuerName = profile?.businessName || profile?.fullName || 'Cobre'
  const issuerSub  = profile?.fullName && profile?.businessName ? profile.fullName : ''

  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // ── Header ─────────────────────────────────────────────────────────────────
  const HEADER_H = 46
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, PAGE_W, HEADER_H, 'F')
  doc.setTextColor(255, 255, 255)

  // Left: issuer name (max 90mm to avoid overlap with right side)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  const nameLines = doc.splitTextToSize(issuerName, 90)
  doc.text(nameLines.slice(0, 2), MARGIN, 17) // max 2 lines

  if (issuerSub) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(199, 210, 254)
    const subLines = doc.splitTextToSize(issuerSub, 90)
    doc.text(subLines[0], MARGIN, nameLines.length > 1 ? 32 : 26)
  }

  // Right: invoice label + number + dates
  doc.setTextColor(199, 210, 254)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('FACTURA', RIGHT, 14, { align: 'right' })

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(invoiceNumber, RIGHT, 22, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(199, 210, 254)
  doc.text(`Emitida: ${new Date(invoice.createdAt).toLocaleDateString('es-ES')}`, RIGHT, 31, { align: 'right' })
  doc.text(`Vence: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}`, RIGHT, 38, { align: 'right' })

  // ── Emisor / Cliente ────────────────────────────────────────────────────────
  let curY = HEADER_H + 14
  doc.setTextColor(30, 30, 30)

  // Section labels
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(120, 120, 120)
  doc.text('EMISOR', MARGIN, curY)
  doc.text('FACTURADO A', COL2, curY)

  curY += 5

  // Issuer lines (left column, max 85mm)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)

  const issuerLines: string[] = [
    profile?.businessName || profile?.fullName || '',
    profile?.taxId ? `NIF/CIF: ${profile.taxId}` : '',
    profile?.address || '',
    profile?.phone || '',
    profile?.email || '',
  ].filter(Boolean)

  let issuerY = curY
  issuerLines.forEach(line => {
    const wrapped = doc.splitTextToSize(line, 85)
    doc.text(wrapped, MARGIN, issuerY)
    issuerY += wrapped.length * 5
  })

  // Client lines (right column, max 85mm)
  doc.setFont('helvetica', 'bold')
  const clientNameLines = doc.splitTextToSize(invoice.clientName, 85)
  doc.text(clientNameLines, COL2, curY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(80, 80, 80)
  const projLines = doc.splitTextToSize(invoice.projectTitle, 85)
  doc.text(projLines, COL2, curY + clientNameLines.length * 5.5)

  // ── Table ───────────────────────────────────────────────────────────────────
  const tableStartY = Math.max(issuerY + 8, curY + clientNameLines.length * 5.5 + projLines.length * 5 + 10)

  const ivaRate  = invoice.ivaRate  ?? 21
  const irpfRate = invoice.irpfRate ?? 0

  const bodyRows = invoice.items && invoice.items.length > 0
    ? invoice.items.map(item => [
        item.description,
        item.quantity % 1 === 0 ? String(item.quantity) : item.quantity.toLocaleString('es-ES'),
        `${fmt(item.unitPrice)} €`,
        `${fmt(item.quantity * item.unitPrice)} €`,
      ])
    : [[invoice.projectTitle, '1', `${fmt(invoice.amount)} €`, `${fmt(invoice.amount)} €`]]

  const subtotal   = invoice.items?.length ? invoice.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) : invoice.amount
  const ivaAmount  = subtotal * (ivaRate / 100)
  const irpfAmount = subtotal * (irpfRate / 100)
  const total      = subtotal + ivaAmount - irpfAmount

  const footRows: string[][] = [
    ['', '', 'Base imponible', `${fmt(subtotal)} €`],
    ['', '', `IVA (${ivaRate}%)`, `${fmt(ivaAmount)} €`],
    ...(irpfRate > 0 ? [['', '', `IRPF (${irpfRate}%)`, `-${fmt(irpfAmount)} €`]] : []),
    ['', '', 'TOTAL', `${fmt(total)} €`],
  ]

  autoTable(doc, {
    startY: tableStartY,
    head: [['Descripción', 'Uds.', 'Precio unit.', 'Total']],
    body: bodyRows,
    foot: footRows,
    headStyles:          { fillColor: [79, 70, 229], fontStyle: 'bold', fontSize: 9 },
    footStyles:          { fillColor: [245, 245, 255], textColor: [30, 30, 30], fontSize: 9, fontStyle: 'normal' },
    alternateRowStyles:  { fillColor: [248, 248, 255] },
    styles:              { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right',  cellWidth: 42 },
      3: { halign: 'right',  cellWidth: 35 },
    },
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // ── Status badge ────────────────────────────────────────────────────────────
  const statusColors: Record<string, [number, number, number]> = {
    paid: [16, 185, 129], sent: [59, 130, 246], overdue: [239, 68, 68], draft: [156, 163, 175],
  }
  const statusLabels: Record<string, string> = {
    paid: 'COBRADA', sent: 'ENVIADA', overdue: 'VENCIDA', draft: 'BORRADOR',
  }
  doc.setFillColor(...(statusColors[invoice.status] || statusColors.draft))
  doc.roundedRect(MARGIN, finalY, 40, 9, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(statusLabels[invoice.status] || 'BORRADOR', MARGIN + 20, finalY + 5.5, { align: 'center' })

  // ── Payment info ────────────────────────────────────────────────────────────
  if (profile?.paymentInfo) {
    const payY = finalY + 16
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.text('Datos de pago:', MARGIN, payY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(70, 70, 70)
    let lineY = payY + 6
    profile.paymentInfo.split('\n').filter(Boolean).forEach(line => {
      const wrapped = doc.splitTextToSize(line, PAGE_W - MARGIN * 2)
      doc.text(wrapped, MARGIN, lineY)
      lineY += wrapped.length * 5
    })
  }

  // ── Footer line ─────────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220)
  doc.line(MARGIN, 283, RIGHT, 283)
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Generado con Cobre · cobre.app', PAGE_W / 2, 287, { align: 'center' })

  doc.save(`${invoiceNumber}-${invoice.clientName.replace(/\s+/g, '_')}.pdf`)
}
