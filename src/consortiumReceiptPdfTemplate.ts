import { jsPDF } from "jspdf";
import {
  buildPdfQrImageDataUrl,
  getConsortiumDocumentUrl,
  getQrSectionSummary,
} from "./consortiumPdfQr.js";
import type {
  AdministrationSettings,
  Consortium,
  ExpenseReceipt,
  Owner,
  Unit,
} from "./interfaz";
import {
  formatAccountStatementAmount,
  getReceiptStatusView,
} from "./consortiumReceiptView";

export interface ConsortiumReceiptPdfTemplateData {
  administration: AdministrationSettings;
  consortium?: Consortium;
  unit?: Unit;
  owner?: Owner;
  receipt: ExpenseReceipt;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 8;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BLUE: [number, number, number] = [7, 59, 83];
const GOLD: [number, number, number] = [190, 138, 43];
const BORDER: [number, number, number] = [216, 225, 232];
const TEXT: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [71, 85, 105];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_BG: [number, number, number] = [248, 250, 252];
const NEGATIVE: [number, number, number] = [220, 38, 38];
const POSITIVE: [number, number, number] = [95, 143, 50];
const PDF_LOGO_WIDTH = 64;
const PDF_LOGO_HEIGHT = 34;

function formatText(value?: string) {
  return value?.trim() || "-";
}

function getImageFormat(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
  if (!match) return "PNG";
  return match[1].toUpperCase() === "JPG" ? "JPEG" : match[1].toUpperCase();
}

function addImageIfPresent(
  doc: jsPDF,
  dataUrl: string | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (!dataUrl) return;

  try {
    doc.addImage(dataUrl, getImageFormat(dataUrl), x, y, width, height);
  } catch {
    // Ignore invalid images and keep generating the PDF.
  }
}

function setTextColor(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(...color);
}

function drawRoundedBlock(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  fill?: [number, number, number],
  stroke: [number, number, number] = BORDER,
) {
  doc.setDrawColor(...stroke);
  if (fill) {
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, width, height, 2.5, 2.5, "FD");
    return;
  }
  doc.roundedRect(x, y, width, height, 2.5, 2.5, "S");
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 3.4,
  align: "left" | "center" | "right" = "left",
) {
  const lines = doc.splitTextToSize(text || "-", maxWidth);
  doc.text(lines, x, y, { align });
  return (Array.isArray(lines) ? lines.length : 1) * lineHeight;
}

function drawSectionHeader(doc: jsPDF, title: string, x: number, y: number, width: number) {
  drawRoundedBlock(doc, x, y, width, 8, BLUE, BLUE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.4);
  setTextColor(doc, WHITE);
  doc.text(title, x + 4, y + 5.3);
  setTextColor(doc, TEXT);
}

function drawInfoCard(
  doc: jsPDF,
  title: string,
  lines: Array<{ label: string; value: string }>,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  drawRoundedBlock(doc, x, y, width, height);
  drawSectionHeader(doc, title, x, y, width);

  let rowY = y + 13;
  lines.forEach(({ label, value }) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    setTextColor(doc, TEXT);
    doc.text(label, x + 4, rowY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    setTextColor(doc, MUTED);
    drawWrappedText(doc, value, x + 27, rowY, width - 31, 3.1);
    rowY += 5.4;
  });
}

function drawMoneyRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  tone: "default" | "positive" | "negative" = "default",
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.1);
  setTextColor(doc, MUTED);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  setTextColor(
    doc,
    tone === "negative" ? NEGATIVE : tone === "positive" ? POSITIVE : TEXT,
  );
  doc.text(value, x + width, y, { align: "right" });
}

function drawHeader(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData) {
  const headerHeight = 33;
  const logoY = MARGIN + (headerHeight - PDF_LOGO_HEIGHT) / 2 - 3;
  drawRoundedBlock(doc, MARGIN, MARGIN, CONTENT_WIDTH, headerHeight);

  addImageIfPresent(doc, data.administration.logo, MARGIN + 2.5, logoY, PDF_LOGO_WIDTH, PDF_LOGO_HEIGHT);

  const centerX = 117;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  setTextColor(doc, BLUE);
  doc.text("RECIBO DE EXPENSAS", centerX, MARGIN + 11, { align: "center" });

  doc.setFontSize(9.4);
  setTextColor(doc, GOLD);
  const consortiumTitle = data.consortium?.direccion
    ? `CONSORCIO ${data.consortium.direccion.toUpperCase()}`
    : data.consortium?.nombre?.toUpperCase() || "CONSORCIO";
  drawWrappedText(doc, consortiumTitle, centerX, MARGIN + 17.5, 64, 3.4, "center");

  const metricX = PAGE_WIDTH - MARGIN - 44;
  [
    ["NRO. RECIBO", formatText(data.receipt.receiptNumber)],
    ["FECHA", formatText(data.receipt.date)],
    ["PERIODO", formatText(data.receipt.period)],
  ].forEach(([label, value], index) => {
    const rowY = MARGIN + 3 + index * 7.6;
    drawRoundedBlock(doc, metricX, rowY, 44, 6.8, LIGHT_BG);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    setTextColor(doc, MUTED);
    doc.text(label, metricX + 2.3, rowY + 2.2);
    doc.setFontSize(7.7);
    setTextColor(doc, TEXT);
    doc.text(value, metricX + 2.3, rowY + 4.9);
  });

  return MARGIN + headerHeight + 4;
}

function drawInfoSection(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const cardHeight = 28;
  drawInfoCard(
    doc,
    "DATOS DEL CONSORCIO",
    [
      { label: "Nombre:", value: formatText(data.consortium?.nombre) },
      {
        label: "Direccion:",
        value: data.consortium?.direccion
          ? `${data.consortium.direccion}${data.consortium.localidad ? `, ${data.consortium.localidad}` : ""}`
          : "-",
      },
      { label: "CUIT:", value: formatText(data.consortium?.cuit) },
    ],
    MARGIN,
    y,
    94,
    cardHeight,
  );
  drawInfoCard(
    doc,
    "DATOS DE LA ADMINISTRACION",
    [
      { label: "Nombre:", value: formatText(data.administration.razonSocial) },
      { label: "CUIT:", value: formatText(data.administration.cuit) },
      { label: "RPA:", value: formatText(data.administration.rpa) },
    ],
    MARGIN + 96,
    y,
    98,
    cardHeight,
  );

  return y + cardHeight + 4;
}

function drawUnitSection(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const cardHeight = 24;
  drawRoundedBlock(doc, MARGIN, y, CONTENT_WIDTH, cardHeight);
  drawSectionHeader(doc, "DATOS DE LA UNIDAD", MARGIN, y, CONTENT_WIDTH);

  const leftX = MARGIN + 4;
  const midX = MARGIN + 80;
  const rightX = MARGIN + 124;

  const rows = [
    [
      { x: leftX, label: "Propietario:", value: formatText(data.owner?.nombre) },
      { x: midX, label: "UF:", value: formatText(data.unit?.numeroUF) },
      {
        x: rightX,
        label: "Direccion:",
        value: data.consortium?.direccion
          ? `${data.consortium.direccion}${data.consortium.localidad ? `, ${data.consortium.localidad}` : ""}`
          : "-",
      },
    ],
    [
      { x: leftX, label: "CUIT / DNI:", value: formatText(data.owner?.cuitDni) },
      { x: midX, label: "Piso:", value: formatText(data.unit?.piso) },
      { x: rightX, label: "Periodo:", value: formatText(data.receipt.period) },
    ],
    [
      { x: leftX, label: "Email:", value: formatText(data.owner?.email) },
      { x: midX, label: "Depto:", value: formatText(data.unit?.departamento) },
      { x: rightX, label: "Telefono:", value: formatText(data.owner?.telefono) },
    ],
  ];

  let rowY = y + 13;
  rows.forEach((row) => {
    row.forEach(({ x, label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.1);
      setTextColor(doc, TEXT);
      doc.text(label, x, rowY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.9);
      setTextColor(doc, MUTED);
      drawWrappedText(doc, value, x + 20, rowY, 40, 2.8);
    });
    rowY += 4.6;
  });

  return y + cardHeight + 4;
}

function drawAccountStatementCard(
  doc: jsPDF,
  data: ConsortiumReceiptPdfTemplateData,
  x: number,
  y: number,
  width: number,
) {
  const statusView = getReceiptStatusView(data.receipt);
  const concepts = statusView.monthlyConcepts;
  const rowHeight = 4.8;
  const conceptRows = Math.max(concepts.length, 1);
  let measuredY = y + 14;

  measuredY += 5.2;
  measuredY += conceptRows * rowHeight;
  measuredY += 5;
  measuredY += 5;
  measuredY += rowHeight;
  measuredY += 4.6;
  measuredY += 5;
  measuredY += 5;
  measuredY += 4.6;
  measuredY += 5;
  measuredY += rowHeight;
  measuredY += rowHeight;

  const cardHeight = measuredY - y + 5;

  drawRoundedBlock(doc, x, y, width, cardHeight);
  drawSectionHeader(doc, "ESTADO DE CUENTA", x, y, width);

  const leftX = x + 5;
  const rightWidth = width - 10;
  let rowY = y + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  setTextColor(doc, BLUE);
  doc.text("CONCEPTOS DEL MES", leftX, rowY);
  rowY += 5.2;

  concepts.forEach((concept) => {
    drawMoneyRow(
      doc,
      concept.description || "Concepto",
      formatAccountStatementAmount(concept.amount),
      leftX,
      rowY,
      rightWidth,
    );
    rowY += rowHeight;
  });

  if (concepts.length === 0) {
    drawMoneyRow(doc, "Sin conceptos cargados", "$ 0,00", leftX, rowY, rightWidth);
    rowY += rowHeight;
  }

  doc.setDrawColor(...BORDER);
  doc.line(leftX, rowY, x + width - 5, rowY);
  rowY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  setTextColor(doc, BLUE);
  doc.text("HISTORICO", leftX, rowY);
  rowY += 5;

  drawMoneyRow(
    doc,
    "Deuda",
    formatAccountStatementAmount(statusView.historicDebt),
    leftX,
    rowY,
    rightWidth,
    statusView.debtIsZero ? "default" : "negative",
  );
  rowY += rowHeight;
  drawMoneyRow(
    doc,
    "Intereses",
    formatAccountStatementAmount(statusView.interest),
    leftX,
    rowY,
    rightWidth,
  );
  rowY += 4.6;

  doc.line(leftX, rowY, x + width - 5, rowY);
  rowY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  setTextColor(doc, BLUE);
  doc.text("TOTAL A PAGAR", leftX, rowY);
  rowY += 5;

  drawMoneyRow(
    doc,
    "Total a pagar",
    formatAccountStatementAmount(statusView.totalToPay),
    leftX,
    rowY,
    rightWidth,
  );
  rowY += 4.6;

  doc.line(leftX, rowY, x + width - 5, rowY);
  rowY += 5;

  drawMoneyRow(
    doc,
    "Pago realizado",
    formatAccountStatementAmount(statusView.paymentMade),
    leftX,
    rowY,
    rightWidth,
  );
  rowY += rowHeight;
  drawMoneyRow(
    doc,
    "Diferencia",
    formatAccountStatementAmount(statusView.difference),
    leftX,
    rowY,
    rightWidth,
    statusView.differenceIsZero ? "positive" : "negative",
  );

  return y + cardHeight;
}

function drawFinalStatusCard(
  doc: jsPDF,
  data: ConsortiumReceiptPdfTemplateData,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const clear = !data.receipt.poseeDeuda;
  const alertFill: [number, number, number] = [254, 242, 242];

  drawRoundedBlock(doc, x, y, width, height);
  drawSectionHeader(doc, "ESTADO FINAL", x, y, width);

  doc.setFillColor(...(clear ? BLUE : alertFill));
  doc.circle(x + width / 2, y + 20, 8.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setTextColor(doc, clear ? WHITE : NEGATIVE);
  doc.text(clear ? "OK" : "!", x + width / 2, y + 21.8, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.2);
  setTextColor(doc, clear ? POSITIVE : NEGATIVE);
  doc.text(
    clear ? "SIN DEUDA A LA FECHA" : "POSEE DEUDA",
    x + width / 2,
    y + 36,
    { align: "center", maxWidth: width - 10 },
  );

  doc.setDrawColor(...GOLD);
  doc.line(x + 8, y + 41, x + width - 8, y + 41);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  setTextColor(doc, MUTED);
  drawWrappedText(
    doc,
    clear ? "Gracias por abonar en termino." : "Queda saldo pendiente.",
    x + width / 2,
    y + 48,
    width - 14,
    3.2,
    "center",
  );
}

function drawAccountAndFinal(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const gap = 4;
  const accountWidth = 130;
  const finalWidth = CONTENT_WIDTH - accountWidth - gap;
  const finalX = MARGIN + accountWidth + gap;
  const accountBottom = drawAccountStatementCard(doc, data, MARGIN, y, accountWidth);
  drawFinalStatusCard(doc, data, finalX, y, finalWidth, accountBottom - y);
  return accountBottom + 4;
}

function drawQrSection(
  doc: jsPDF,
  data: ConsortiumReceiptPdfTemplateData,
  y: number,
  qrDataUrl: string | null,
) {
  const documentUrl = getConsortiumDocumentUrl(data.consortium);
  const section = getQrSectionSummary(documentUrl);
  if (!section || !qrDataUrl) return y;

  const sectionX = MARGIN;
  const sectionY = y;
  const sectionW = CONTENT_WIDTH;
  const sectionH = 38;
  const headerH = 8;
  const contentY = sectionY + headerH;
  const contentH = sectionH - headerH;
  const padding = 3;
  const gap = 4;
  const leftColW = 62;
  const qrBoxSize = contentH - padding * 2;
  const qrSize = qrBoxSize - 6;
  const qrBoxX = sectionX + padding + leftColW + gap;
  const qrBoxY = contentY + padding;
  const qrX = qrBoxX + (qrBoxSize - qrSize) / 2;
  const qrY = qrBoxY + (qrBoxSize - qrSize) / 2;
  const leftTextX = sectionX + padding;
  const leftTextY = contentY + padding + 1;
  const rightTextX = qrBoxX + qrBoxSize + gap;
  const rightTextY = contentY + padding + 1;
  const rightColActualW = sectionX + sectionW - padding - rightTextX;

  drawRoundedBlock(doc, sectionX, sectionY, sectionW, sectionH);
  drawSectionHeader(doc, section.title, sectionX, sectionY, sectionW);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setTextColor(doc, MUTED);
  drawWrappedText(
    doc,
    "Escanea el QR para acceder a la documentacion del consorcio.",
    leftTextX,
    leftTextY,
    leftColW,
    2.9,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  setTextColor(doc, TEXT);
  drawWrappedText(
    doc,
    "Liquidaciones y recibos · Actas · Reglamento · Seguros · Mantenimiento",
    leftTextX,
    leftTextY + 8.5,
    leftColW,
    2.7,
  );

  drawRoundedBlock(doc, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, LIGHT_BG);
  addImageIfPresent(
    doc,
    qrDataUrl,
    qrX,
    qrY,
    qrSize,
    qrSize,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.3);
  setTextColor(doc, BLUE);
  drawWrappedText(
    doc,
    "Este recibo corresponde al pago registrado para la unidad indicada.",
    rightTextX,
    rightTextY,
    rightColActualW,
    2.9,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.9);
  setTextColor(doc, MUTED);
  drawWrappedText(
    doc,
    "El detalle completo de la liquidacion se encuentra en la expensa mensual enviada.",
    rightTextX,
    rightTextY + 8.4,
    rightColActualW,
    2.7,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.1);
  setTextColor(doc, BLUE);
  doc.text("Carpeta del consorcio:", rightTextX, rightTextY + 17.6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  setTextColor(doc, MUTED);
  drawWrappedText(doc, documentUrl, rightTextX, rightTextY + 21, rightColActualW, 2.5);

  return sectionY + sectionH + 4;
}

function drawBottomSection(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const leftWidth = 64;
  const centerWidth = 48;
  const rightWidth = CONTENT_WIDTH - leftWidth - centerWidth - 4;
  const centerX = MARGIN + leftWidth + 2;
  const rightX = centerX + centerWidth + 2;
  const height = 22;
  const signatureWidth = 28;
  const signatureHeight = 10;
  const signatureX = MARGIN + (leftWidth - signatureWidth) / 2;
  const signatureY = y + 1.5;

  drawRoundedBlock(doc, MARGIN, y, leftWidth, height);
  drawRoundedBlock(doc, centerX, y, centerWidth, height, LIGHT_BG, GOLD);
  drawRoundedBlock(doc, rightX, y, rightWidth, height, BLUE, BLUE);

  addImageIfPresent(doc, data.administration.firmaUrl, signatureX, signatureY, signatureWidth, signatureHeight);
  doc.setDrawColor(...BLUE);
  doc.line(MARGIN + 4, y + 13, MARGIN + leftWidth - 4, y + 13);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  setTextColor(doc, BLUE);
  doc.text("PIVA Administracion y Servicios", MARGIN + leftWidth / 2, y + 16.1, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.1);
  setTextColor(doc, MUTED);
  doc.text("Administracion", MARGIN + leftWidth / 2, y + 19.2, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.8);
  setTextColor(doc, BLUE);
  doc.text("RECIBO VALIDO", centerX + centerWidth / 2, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.1);
  setTextColor(doc, MUTED);
  doc.text("Comprobante emitido por\nPIVA Administracion.", centerX + centerWidth / 2, y + 12, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  setTextColor(doc, WHITE);
  doc.text("CONTACTO", rightX + 4, y + 5.7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  [
    formatText(data.administration.telefono),
    formatText(data.administration.email),
    formatText(data.administration.direccion),
  ].forEach((line, index) => {
    doc.text(line, rightX + 4, y + 9.5 + index * 2.8, {
      maxWidth: rightWidth - 8,
    });
  });

  return y + height + 4;
}

function drawDisclaimer(doc: jsPDF, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  setTextColor(doc, MUTED);
  doc.text(
    "Ante cualquier consulta o diferencia, comunicarse con la Administracion dentro de los 30 dias de emitido el presente comprobante.",
    PAGE_WIDTH / 2,
    Math.min(y + 1.5, PAGE_HEIGHT - 4),
    { align: "center", maxWidth: CONTENT_WIDTH },
  );
}

export async function generateConsortiumReceiptPdf(
  data: ConsortiumReceiptPdfTemplateData,
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  doc.setProperties({
    title: "Recibo de Consorcio",
    subject: "Recibo de expensas",
    author: "PIVA Administracion y Servicios",
    creator: "recibos-llamas",
  });

  let y = drawHeader(doc, data);
  y = drawInfoSection(doc, data, y);
  y = drawUnitSection(doc, data, y);
  y = drawAccountAndFinal(doc, data, y);
  const qrDataUrl = await buildPdfQrImageDataUrl(getConsortiumDocumentUrl(data.consortium));
  y = drawQrSection(doc, data, y, qrDataUrl);
  y = drawBottomSection(doc, data, y);
  drawDisclaimer(doc, y);

  const fileName = `recibo-consorcio-${data.receipt.receiptNumber || "sin-numero"}.pdf`;
  const pageCount = doc.getNumberOfPages();
  doc.save(fileName);
  return { pageCount, fileName };
}
