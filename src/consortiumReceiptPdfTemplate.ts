import { jsPDF } from "jspdf";
import {
  buildPdfQrImageDataUrl,
  getConsortiumDocumentUrl,
  getQrSectionSummary,
} from "./consortiumPdfQr.js";
import { money } from "./helpers";
import {
  getReceiptPaidTotal,
  getReceiptStatusView,
} from "./consortiumReceiptView";
import type {
  AdministrationSettings,
  Consortium,
  ExpenseReceipt,
  Owner,
  Unit,
} from "./interfaz";

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
const CARD_GAP = 6;
const LEFT_CARD_WIDTH = 94;
const RIGHT_CARD_WIDTH = 94;
const BLUE: [number, number, number] = [7, 59, 83];
const GOLD: [number, number, number] = [190, 138, 43];
const BORDER: [number, number, number] = [216, 225, 232];
const TEXT: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [71, 85, 105];
const WHITE: [number, number, number] = [255, 255, 255];
const PDF_LOGO_WIDTH = 50;
const PDF_LOGO_HEIGHT = 25;

function formatMoney(value: number | "") {
  return money(value) || "$ 0,00";
}

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
    // Ignore broken images and keep generating the PDF.
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
  options?: {
    fill?: [number, number, number];
    stroke?: [number, number, number];
    radius?: number;
  },
) {
  const radius = options?.radius ?? 2.5;
  if (options?.fill) {
    doc.setFillColor(...options.fill);
    if (options.stroke) {
      doc.setDrawColor(...options.stroke);
      doc.roundedRect(x, y, width, height, radius, radius, "FD");
      return;
    }
    doc.roundedRect(x, y, width, height, radius, radius, "F");
    return;
  }

  doc.setDrawColor(...(options?.stroke || BORDER));
  doc.roundedRect(x, y, width, height, radius, radius, "S");
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 3.7,
  align: "left" | "center" | "right" = "left",
) {
  const lines = doc.splitTextToSize(text || "-", maxWidth);
  doc.text(lines, x, y, { align });
  return (Array.isArray(lines) ? lines.length : 1) * lineHeight;
}

function drawCurrency(doc: jsPDF, value: number | "", xRight: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.text(formatMoney(value), xRight, y, { align: "right" });
}

function drawMoneyRow(
  doc: jsPDF,
  label: string,
  value: number | "",
  x: number,
  y: number,
  valueXRight: number,
  tone: "default" | "positive" | "negative" = "default",
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor(doc, MUTED);
  doc.text(label, x, y, { maxWidth: valueXRight - x - 28 });
  setTextColor(
    doc,
    tone === "positive" ? [95, 143, 50] : tone === "negative" ? [220, 38, 38] : TEXT,
  );
  drawCurrency(doc, value, valueXRight, y);
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number,
  valueWidth: number,
  lineHeight = 3.7,
) {
  const safeValue = formatText(value);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setTextColor(doc, TEXT);
  doc.text(label, x, y);

  doc.setFont("helvetica", "normal");
  setTextColor(doc, MUTED);
  const valueX = x + labelWidth + 2;
  const lines = doc.splitTextToSize(safeValue, valueWidth);
  doc.text(lines, valueX, y);
  return (Array.isArray(lines) ? lines.length : 1) * lineHeight;
}

function drawSectionTitle(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  width: number,
  accent: "blue" | "gold" = "blue",
  iconName?: "building" | "user" | "home" | "wallet" | "check",
) {
  const color = accent === "gold" ? GOLD : BLUE;
  drawRoundedBlock(doc, x, y, width, 8, {
    fill: color,
    stroke: color,
    radius: 2.5,
  });
  if (iconName) {
    drawIconBadge(doc, iconName, x + 6.5, y + 4.5, 2.8, color);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.4);
  setTextColor(doc, WHITE);
  doc.text(title, x + (iconName ? 13 : 4), y + 5.3);
  setTextColor(doc, TEXT);
}

function drawSectionCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  accent: "blue" | "gold" = "blue",
  iconName?: "building" | "user" | "home" | "wallet" | "check",
) {
  drawRoundedBlock(doc, x, y, width, height, {
    stroke: BORDER,
    radius: 2.5,
  });
  drawSectionTitle(doc, title, x, y, width, accent, iconName);
}

function drawIconBadge(
  doc: jsPDF,
  iconName: "building" | "user" | "home" | "wallet" | "check",
  cx: number,
  cy: number,
  radius: number,
  bgColor: [number, number, number],
) {
  doc.setFillColor(...bgColor);
  doc.circle(cx, cy, radius, "F");
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.38);

  if (iconName === "building") {
    doc.rect(cx - 1.35, cy - 0.8, 2.7, 2.5);
    doc.line(cx - 1.35, cy - 0.8, cx, cy - 2.15);
    doc.line(cx, cy - 2.15, cx + 1.35, cy - 0.8);
    doc.line(cx - 0.65, cy + 1.7, cx - 0.65, cy + 0.45);
    doc.line(cx, cy + 1.7, cx, cy + 0.45);
    doc.line(cx + 0.65, cy + 1.7, cx + 0.65, cy + 0.45);
    return;
  }

  if (iconName === "user") {
    doc.circle(cx, cy - 0.9, 0.95, "S");
    doc.line(cx - 1.8, cy + 1.3, cx - 0.7, cy + 0.2);
    doc.line(cx + 1.8, cy + 1.3, cx + 0.7, cy + 0.2);
    doc.line(cx - 0.7, cy + 0.2, cx + 0.7, cy + 0.2);
    return;
  }

  if (iconName === "home") {
    doc.line(cx - 1.9, cy - 0.1, cx, cy - 1.8);
    doc.line(cx, cy - 1.8, cx + 1.9, cy - 0.1);
    doc.rect(cx - 1.45, cy - 0.1, 2.9, 2.2);
    doc.line(cx - 0.45, cy + 2.1, cx - 0.45, cy + 0.8);
    doc.line(cx + 0.45, cy + 2.1, cx + 0.45, cy + 0.8);
    return;
  }

  if (iconName === "wallet") {
    doc.roundedRect(cx - 2.1, cy - 0.9, 4.2, 2.8, 0.5, 0.5, "S");
    doc.line(cx - 1.5, cy - 1.5, cx + 1.6, cy - 1.5);
    doc.line(cx + 0.8, cy + 0.5, cx + 2.1, cy + 0.5);
    return;
  }

  doc.line(cx - 1.5, cy, cx - 0.3, cy + 1.2);
  doc.line(cx - 0.3, cy + 1.2, cx + 1.8, cy - 1.4);
}

function drawHeader(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData) {
  console.log("[PDF] usando nuevo generador compacto");
  console.log("[PDF] datos recibidos", data.receipt);

  const headerHeight = 31;
  drawRoundedBlock(doc, MARGIN, MARGIN, CONTENT_WIDTH, headerHeight, {
    stroke: BORDER,
    radius: 3,
  });

  const logoX = MARGIN + 4;
  const logoY = MARGIN + 4.5;
  addImageIfPresent(doc, data.administration.logo, logoX, logoY, PDF_LOGO_WIDTH, PDF_LOGO_HEIGHT);

  setTextColor(doc, BLUE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("RECIBO DE EXPENSAS", 118, MARGIN + 10.8, { align: "center" });
  setTextColor(doc, GOLD);
  doc.setFontSize(9.2);
  drawWrappedText(
    doc,
    data.consortium?.direccion
      ? `CONSORCIO ${data.consortium.direccion.toUpperCase()}`
      : data.consortium?.nombre?.toUpperCase() || "CONSORCIO",
    118,
    MARGIN + 17.4,
    68,
    3.4,
    "center",
  );
  const metricX = PAGE_WIDTH - MARGIN - 44;
  const metricWidth = 44;
  const metricHeight = 6.7;
  [
    ["NRO. RECIBO", formatText(data.receipt.receiptNumber)],
    ["FECHA DE PAGO", formatText(data.receipt.date)],
    ["PERIODO", formatText(data.receipt.period)],
  ].forEach(([label, value], index) => {
    const rowY = MARGIN + 3 + index * 7.5;
    drawRoundedBlock(doc, metricX, rowY, metricWidth, metricHeight, {
      fill: [248, 250, 252],
      stroke: BORDER,
      radius: 2,
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    setTextColor(doc, [100, 116, 139]);
    doc.text(label, metricX + 2.5, rowY + 2.3);
    doc.setFontSize(7.9);
    setTextColor(doc, TEXT);
    doc.text(value, metricX + 2.5, rowY + 5);
  });

  return MARGIN + headerHeight + 4;
}

function drawInfoCards(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const leftX = MARGIN;
  const rightX = MARGIN + LEFT_CARD_WIDTH + CARD_GAP;
  const height = 29;

  drawSectionCard(doc, leftX, y, LEFT_CARD_WIDTH, height, "DATOS DEL CONSORCIO", "blue", "building");
  drawSectionCard(doc, rightX, y, RIGHT_CARD_WIDTH, height, "DATOS DE LA ADMINISTRACION", "blue", "user");

  let leftY = y + 14;
  leftY += drawLabelValue(doc, "Nombre:", formatText(data.consortium?.nombre), leftX + 4, leftY, 18, 66);
  leftY += 1.6;
  leftY += drawLabelValue(
    doc,
    "Direccion:",
    data.consortium?.direccion
      ? `${data.consortium.direccion}${data.consortium.localidad ? `, ${data.consortium.localidad}` : ""}`
      : "-",
    leftX + 4,
    leftY,
    18,
    66,
  );
  leftY += 1.6;
  drawLabelValue(doc, "CUIT:", formatText(data.consortium?.cuit), leftX + 4, leftY, 18, 66);

  let rightY = y + 14;
  rightY += drawLabelValue(
    doc,
    "Administracion:",
    formatText(data.administration.razonSocial),
    rightX + 4,
    rightY,
    24,
    60,
  );
  rightY += 1.6;
  rightY += drawLabelValue(doc, "CUIT:", formatText(data.administration.cuit), rightX + 4, rightY, 24, 60);
  rightY += 1.6;
  drawLabelValue(doc, "RPA:", formatText(data.administration.rpa), rightX + 4, rightY, 24, 60);

  return y + height + 4;
}

function drawUnitCard(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const height = 27;
  drawSectionCard(doc, MARGIN, y, CONTENT_WIDTH, height, "DATOS DE LA UNIDAD", "gold", "home");

  let rowY = y + 14;
  rowY += drawLabelValue(doc, "Propietario / Inquilino:", formatText(data.owner?.nombre), MARGIN + 4, rowY, 30, 58);
  rowY += 1.4;
  drawLabelValue(doc, "CUIT / DNI:", formatText(data.owner?.cuitDni), MARGIN + 4, rowY, 30, 58);

  let midY = y + 14;
  midY += drawLabelValue(doc, "Unidad Funcional:", formatText(data.unit?.numeroUF), MARGIN + 83, midY, 24, 16);
  midY += 1.4;
  midY += drawLabelValue(doc, "Piso:", formatText(data.unit?.piso), MARGIN + 83, midY, 24, 16);
  midY += 1.4;
  drawLabelValue(doc, "Departamento:", formatText(data.unit?.departamento), MARGIN + 83, midY, 24, 16);

  const unitAddress = data.consortium?.direccion
    ? `${data.consortium.direccion}${data.consortium.localidad ? `, ${data.consortium.localidad}` : ""}`
    : "-";
  let rightY = y + 14;
  rightY += drawLabelValue(doc, "Direccion:", unitAddress, MARGIN + 122, rightY, 18, 58);
  rightY += 1.4;
  drawLabelValue(doc, "Periodo abonado:", formatText(data.receipt.period), MARGIN + 122, rightY, 24, 52);

  return y + height + 4;
}

function drawAccountAndFinal(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const leftWidth = 130;
  const rightWidth = CONTENT_WIDTH - leftWidth - CARD_GAP;
  const rightX = MARGIN + leftWidth + CARD_GAP;
  const concepts = data.receipt.concepts.filter(
    (concept) => concept.description.trim() || concept.amount !== "",
  );
  const statusView = getReceiptStatusView(data.receipt);

  const rowHeight = 4.6;
  const baseRowsBottomY = y + 40.8;
  const conceptsStartY = baseRowsBottomY + 7.4;
  const conceptsHeight = 8 + concepts.length * rowHeight;
  const leftHeight = Math.max(58, conceptsStartY - y + conceptsHeight);
  const rightHeight = leftHeight;

  drawSectionCard(doc, MARGIN, y, leftWidth, leftHeight, "ESTADO DE CUENTA", "blue", "wallet");
  drawSectionCard(doc, rightX, y, rightWidth, rightHeight, "ESTADO FINAL", "blue", "check");

  const valueXRight = MARGIN + leftWidth - 5;
  let stateY = y + 14;
  drawMoneyRow(doc, "Saldo anterior", data.receipt.accountStatus.saldoAnterior, MARGIN + 5, stateY, valueXRight);
  stateY += 4.8;
  drawMoneyRow(doc, "Deuda", statusView.debt, MARGIN + 5, stateY, valueXRight, statusView.debt > 0 ? "negative" : "default");
  stateY += 4.8;
  drawMoneyRow(doc, "Intereses", statusView.interests, MARGIN + 5, stateY, valueXRight);

  doc.setDrawColor(...BORDER);
  doc.line(MARGIN + 4, y + 29.5, MARGIN + leftWidth - 4, y + 29.5);
  stateY = y + 36;
  drawMoneyRow(doc, "Pago realizado", statusView.paidTotal, MARGIN + 5, stateY, valueXRight);
  stateY += 4.8;
  drawMoneyRow(
    doc,
    "Diferencia",
    statusView.difference,
    MARGIN + 5,
    stateY,
    valueXRight,
    statusView.difference > 0 ? "negative" : "positive",
  );

  doc.line(MARGIN + 4, stateY + 3.6, MARGIN + leftWidth - 4, stateY + 3.6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.4);
  setTextColor(doc, [100, 116, 139]);
  doc.text("Concepto", MARGIN + 5, conceptsStartY + 1.8);
  doc.text("Importe", MARGIN + leftWidth - 5, conceptsStartY + 1.8, { align: "right" });
  doc.setDrawColor(...BORDER);
  doc.line(MARGIN + 4, conceptsStartY + 3.7, MARGIN + leftWidth - 4, conceptsStartY + 3.7);

  let conceptY = conceptsStartY + 6.6;
  concepts.forEach((concept) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.7);
    setTextColor(doc, TEXT);
    const conceptLines = doc.splitTextToSize(formatText(concept.description), leftWidth - 42);
    doc.text(conceptLines, MARGIN + 5, conceptY);
    drawCurrency(doc, concept.amount, MARGIN + leftWidth - 5, conceptY);
    conceptY += rowHeight;
  });

  const clear = statusView.clear;
  const circleFill = clear ? BLUE : [254, 242, 242];
  const circleText = clear ? WHITE : [220, 38, 38];
  doc.setFillColor(...(circleFill as [number, number, number]));
  doc.circle(rightX + rightWidth / 2, y + 18, 8.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setTextColor(doc, circleText as [number, number, number]);
  doc.text(clear ? "OK" : "!", rightX + rightWidth / 2, y + 19.8, { align: "center" });
  setTextColor(doc, BLUE);
  doc.setFontSize(8.3);
  doc.text("Estado final", rightX + rightWidth / 2, y + 32, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.line(rightX + 8, y + 35, rightX + rightWidth - 8, y + 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  setTextColor(doc, clear ? [95, 143, 50] : [220, 38, 38]);
  doc.text(clear ? "SIN DEUDA A LA FECHA" : "POSEE DEUDA", rightX + rightWidth / 2, y + 42.5, {
    align: "center",
    maxWidth: rightWidth - 10,
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  setTextColor(doc, MUTED);
  drawWrappedText(
    doc,
    clear ? "Gracias por abonar en termino." : "Queda saldo pendiente.",
    rightX + rightWidth / 2,
    y + 49.5,
    rightWidth - 14,
    3.4,
    "center",
  );

  const yAfterConcepts = conceptsStartY + concepts.length * rowHeight + 8;
  const totalY = Math.max(yAfterConcepts, y + leftHeight + 4);

  return { totalY };
}

function drawTotalBar(doc: jsPDF, totalPaid: number, y: number) {
  const height = 10;
  drawRoundedBlock(doc, MARGIN, y, CONTENT_WIDTH, height, {
    fill: BLUE,
    stroke: BLUE,
    radius: 2.5,
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor(doc, WHITE);
  doc.text("TOTAL ABONADO", MARGIN + 5, y + 6.4);
  doc.text(formatMoney(totalPaid), PAGE_WIDTH - MARGIN - 5, y + 6.4, { align: "right" });
  setTextColor(doc, TEXT);
  return y + height + 4;
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
  const sectionWidth = CONTENT_WIDTH;
  const sectionHeight = section.height;
  const padding = 4;
  const gap = 5;
  const leftWidth = 70;
  const qrColWidth = 34;
  const rightWidth = sectionWidth - padding * 2 - leftWidth - qrColWidth - gap * 2;
  const leftX = sectionX + padding;
  const qrColX = leftX + leftWidth + gap;
  const rightX = qrColX + qrColWidth + gap;
  const qrSize = 20;
  const qrBoxSize = 26;
  const qrBoxPadding = 3;
  const qrBoxX = qrColX + (qrColWidth - qrBoxSize) / 2;
  const qrBoxY = y + 8.5;
  const qrImageX = qrBoxX + qrBoxPadding;
  const qrImageY = qrBoxY + qrBoxPadding;
  const qrText = "Liquidaciones y recibos · Actas · Reglamento · Seguros · Mantenimiento";
  const fullUrl = documentUrl;
  const displayUrl =
    fullUrl.length > 70 ? `${fullUrl.slice(0, 67).trimEnd()}...` : fullUrl;

  drawRoundedBlock(doc, sectionX, y, sectionWidth, sectionHeight, {
    stroke: BORDER,
    radius: 2.5,
  });
  drawSectionTitle(doc, section.title, sectionX, y, sectionWidth, "blue");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.7);
  setTextColor(doc, MUTED);
  let leftY = y + 13;
  leftY += drawWrappedText(doc, section.description, leftX, leftY, leftWidth, 3.1);
  leftY += 3;

  doc.setFontSize(6.5);
  drawWrappedText(doc, qrText, leftX, leftY, leftWidth, 3, "left");

  drawRoundedBlock(doc, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, {
    fill: [248, 250, 252],
    stroke: BORDER,
    radius: 2.5,
  });
  addImageIfPresent(doc, qrDataUrl, qrImageX, qrImageY, qrSize, qrSize);

  doc.setDrawColor(...BORDER);
  doc.line(rightX - gap / 2, y + 9.5, rightX - gap / 2, y + sectionHeight - 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.6);
  setTextColor(doc, TEXT);
  let rightY = y + 12.4;
  rightY += drawWrappedText(doc, section.notes[0], rightX, rightY, rightWidth, 3);
  rightY += 3;
  doc.setFont("helvetica", "bold");
  rightY += drawWrappedText(doc, section.notes[1], rightX, rightY, rightWidth, 3);
  rightY += 1.8;

  const linkBoxHeight = 8;
  drawRoundedBlock(doc, rightX, rightY, rightWidth, linkBoxHeight, {
    fill: [248, 250, 252],
    stroke: BORDER,
    radius: 2,
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  setTextColor(doc, BLUE);
  doc.text("Carpeta del consorcio:", rightX + 2, rightY + 2.8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  setTextColor(doc, MUTED);
  drawWrappedText(doc, displayUrl, rightX + 2, rightY + 5.9, rightWidth - 4, 2.5);

  return y + sectionHeight + 4;
}

function drawBottomRow(doc: jsPDF, data: ConsortiumReceiptPdfTemplateData, y: number) {
  const leftWidth = 62;
  const centerWidth = 56;
  const rightWidth = CONTENT_WIDTH - leftWidth - centerWidth - 4;
  const centerX = MARGIN + leftWidth + 2;
  const rightX = centerX + centerWidth + 2;
  const height = 19;

  drawRoundedBlock(doc, MARGIN, y, leftWidth, height, {
    stroke: BORDER,
    radius: 2.5,
  });
  drawRoundedBlock(doc, centerX, y, centerWidth, height, {
    stroke: [234, 217, 176],
    radius: 2.5,
  });
  drawRoundedBlock(doc, rightX, y, rightWidth, height, {
    fill: BLUE,
    stroke: BLUE,
    radius: 2.5,
  });

  addImageIfPresent(doc, data.administration.firmaUrl, MARGIN + 19, y + 1.8, 24, 8.5);
  doc.setDrawColor(14, 73, 96);
  doc.line(MARGIN + 4, y + 13.2, MARGIN + leftWidth - 4, y + 13.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.3);
  setTextColor(doc, BLUE);
  doc.text(
    formatText(data.administration.firmaAclaracion || "Firma autorizada"),
    MARGIN + leftWidth / 2,
    y + 16.2,
    { align: "center", maxWidth: leftWidth - 8 },
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.2);
  setTextColor(doc, BLUE);
  doc.text("RECIBO VALIDO", centerX + centerWidth / 2, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setTextColor(doc, MUTED);
  doc.text(
    "Comprobante emitido por\nPIVA Administracion y Servicios.",
    centerX + centerWidth / 2,
    y + 11.8,
    { align: "center" },
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.1);
  setTextColor(doc, WHITE);
  doc.text("CANALES DE CONTACTO", rightX + 4, y + 5.8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  [
    formatText(data.administration.telefono),
    formatText(data.administration.email),
    formatText(data.administration.direccion),
  ].forEach((line, index) => {
    doc.text(line, rightX + 4, y + 9.8 + index * 2.9, {
      maxWidth: rightWidth - 8,
    });
  });

  return y + height + 4;
}

function drawDisclaimer(doc: jsPDF, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  setTextColor(doc, [100, 116, 139]);
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
  y = drawInfoCards(doc, data, y);
  y = drawUnitCard(doc, data, y);
  const accountResult = drawAccountAndFinal(doc, data, y);
  y = drawTotalBar(doc, getReceiptPaidTotal(data.receipt), accountResult.totalY);
  const qrDataUrl = await buildPdfQrImageDataUrl(getConsortiumDocumentUrl(data.consortium));
  y = drawQrSection(doc, data, y, qrDataUrl);
  y = drawBottomRow(doc, data, y);
  drawDisclaimer(doc, y);
  console.log("[PDF] template compacto renderizado");

  const pageCount = doc.getNumberOfPages();
  console.log("[PDF] paginas generadas", pageCount);

  const fileName = `recibo-consorcio-${data.receipt.receiptNumber || "sin-numero"}.pdf`;
  console.log("[PDF] descarga iniciada", fileName);
  doc.save(fileName);
  return { pageCount, fileName };
}
