import { PDFDocument, StandardFonts, PDFPage, PDFFont, rgb } from 'pdf-lib'
import { Report } from '../../interfaces/reportTypes'
import {
  dmColumns,
  totalsConfig,
} from './reportConfig'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 40
const FONT_SIZE = 9
const LINE_HEIGHT = 13

const ROW_GRAY = rgb(0.93, 0.93, 0.93)
const TABLE_WIDTH = dmColumns.reduce((acc, c) => acc + c.width, 0)

export class ReportPdf {
  private pdfDoc!: PDFDocument
  private font!: PDFFont
  private boldFont!: PDFFont
  private page!: PDFPage
  private y!: number
  private dmRowIndex = 0

  async generate(report: Report, createdAt: Date): Promise<Buffer> {
    this.pdfDoc = await PDFDocument.create()

    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica)
    this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold)

    this.createPage()

    this.drawHeader(createdAt)
    this.drawTotals(report)
    this.drawDmSection(report)

    const pdfBytes = await this.pdfDoc.save()

    return Buffer.from(pdfBytes)
  }

  private createPage() {
    this.page = this.pdfDoc.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ])

    this.y = PAGE_HEIGHT - MARGIN
  }

  private ensureSpace() {
    if (this.y < MARGIN + 20) {
      this.createPage()
    }
  }

  private drawText(
    text: string,
    size: number = FONT_SIZE,
    isBold = false,
  ) {
    this.ensureSpace()

    this.page.drawText(text, {
      x: MARGIN,
      y: this.y,
      size,
      font: isBold ? this.boldFont : this.font,
    })

    this.y -= LINE_HEIGHT
  }

  private drawHeader(createdAt: Date) {
    this.page.drawText('Relatório de Estatísticas - Mesas', {
      x: MARGIN,
      y: this.y,
      size: 18,
      font: this.boldFont,
    })

    this.y -= 30

    const createdAtString = createdAt.toLocaleString('pt-BR')

    this.page.drawText(`Gerado em: ${createdAtString}`, {
      x: MARGIN,
      y: this.y,
      size: 10,
      font: this.font,
    })

    this.y -= 25
  }

  private drawTotals(report: Report) {
    this.drawText('RESUMO GERAL', 13, true)

    this.y -= 5

    for (const item of totalsConfig) {
      this.drawText(
        `${item.label}: ${item.value(report.totals)}`,
      )
    }

    this.y -= 10
  }

  private drawDmSection(report: Report) {
    this.drawText('INFORMAÇÕES POR MESTRE', 13, true)

    this.y -= 5

    this.drawText('Legenda:', 8, true)

    for (const column of dmColumns) {
        this.drawText(column.legend, 7)
    }

    this.y -= 5

    this.dmRowIndex = 0
    this.drawTableHeader()

    for (const dm of report.per_dm) {
      if (this.y < MARGIN + 20) {
        this.createPage()
        this.drawTableHeader()
      }

      this.drawTableRow(dm)
    }
  }

  private drawTableHeader() {
    this.ensureSpace()

    let x = MARGIN

    for (const column of dmColumns) {
      this.page.drawText(column.header, {
        x,
        y: this.y,
        size: 6,
        font: this.boldFont,
      })

      x += column.width
    }

    this.y -= LINE_HEIGHT + 2
  }

  private drawTableRow(dm: Report['per_dm'][number]) {
    if (this.dmRowIndex % 2 === 0) {
      this.page.drawRectangle({
        x: MARGIN,
        y: this.y - 3,
        width: TABLE_WIDTH,
        height: LINE_HEIGHT,
        color: ROW_GRAY,
      })
    }

    let x = MARGIN

    for (const column of dmColumns) {
      const rawValue = dm[column.key]

      const value = column.format
        ? column.format(rawValue, dm)
        : String(rawValue)

      this.page.drawText(value, {
        x,
        y: this.y,
        size: 6,
        font: this.font,
      })

      x += column.width
    }

    this.y -= LINE_HEIGHT
    this.dmRowIndex++
  }
}