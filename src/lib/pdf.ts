import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, Profile } from './types'

export function generateInvoicePDF(invoice: Invoice, invoiceNumber: string, profile?: Profile | null) {
  const doc = new jsPDF()

  const issuerName = profile?.businessName || profile?.fullName || 'FreelanceHub'
  const issuerSub = profile?.fullName && profile?.businessName ? profile.fullName : 'Tu negocio, ordenado.'

  // Header
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, 210, 42, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(issuerName, 14, 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(issuerSub, 14, 26)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`FACTURA ${invoiceNumber}`, 196, 18, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${new Date(invoice.createdAt).toLocaleDateString('es-ES')}`, 196, 26, { align: 'right' })
  doc.text(`Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}`, 196, 33, { align: 'right' })

  // Emisor (Freelancer)
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Emisor:', 14, 56)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const issuerLines = [
    profile?.businessName || profile?.fullName || '',
    profile?.taxId ? `NIF: ${profile.taxId}` : '',
    profile?.address || '',
    profile?.email || '',
    profile?.phone || '',
  ].filter(Boolean)
  issuerLines.forEach((line, i) => doc.text(line, 14, 63 + i * 5))

  // Cliente
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Facturado a:', 110, 56)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(invoice.clientName, 110, 63)
  doc.text(invoice.projectTitle, 110, 68)

  // Table
  const tableStartY = Math.max(80, 63 + issuerLines.length * 5 + 8)

  autoTable(doc, {
    startY: tableStartY,
    head: [['Descripción', 'Uds.', 'Precio', 'Total']],
    body: [
      [invoice.projectTitle, '1', `${invoice.amount.toLocaleString('es-ES')} €`, `${invoice.amount.toLocaleString('es-ES')} €`],
    ],
    foot: [
      ['', '', 'Base imponible', `${invoice.amount.toLocaleString('es-ES')} €`],
      ['', '', 'IVA (21%)', `${(invoice.amount * 0.21).toLocaleString('es-ES', { maximumFractionDigits: 2 })} €`],
      ['', '', 'TOTAL', `${(invoice.amount * 1.21).toLocaleString('es-ES', { maximumFractionDigits: 2 })} €`],
    ],
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [245, 245, 255], textColor: [30, 30, 30], fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 45 },
      3: { halign: 'right', cellWidth: 35 },
    },
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    paid: [16, 185, 129], sent: [59, 130, 246], overdue: [239, 68, 68], draft: [156, 163, 175],
  }
  const statusLabels: Record<string, string> = {
    paid: 'COBRADA', sent: 'ENVIADA', overdue: 'VENCIDA', draft: 'BORRADOR'
  }
  doc.setFillColor(...(statusColors[invoice.status] || statusColors.draft))
  doc.roundedRect(14, finalY, 38, 9, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(statusLabels[invoice.status] || 'BORRADOR', 33, finalY + 5.5, { align: 'center' })

  // Footer
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Generado con FreelanceHub', 105, 287, { align: 'center' })

  doc.save(`${invoiceNumber}-${invoice.clientName.replace(/\s+/g, '_')}.pdf`)
}
