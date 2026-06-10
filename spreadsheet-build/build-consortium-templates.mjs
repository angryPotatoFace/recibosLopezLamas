import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve(
  process.cwd(),
  "..",
  "outputs",
  "2026-06-10-consorcio-templates",
);

const minimumHeaders = [
  "administracion",
  "cuitadministracion",
  "rpa",
  "direccionadministracion",
  "telefonoadministracion",
  "emailadministracion",
  "websiteadministracion",
  "firmaaclaracion",
  "consorcio",
  "direccionconsorcio",
  "localidadconsorcio",
  "cuitconsorcio",
  "urldocumentacion",
  "uf",
  "piso",
  "departamento",
  "porcentajeexpensas",
  "propietario",
  "cuitdni",
  "telefonopropietario",
  "emailpropietario",
  "numerorecibo",
  "fecha",
  "periodo",
  "saldoanterior",
  "pagorealizado",
  "saldoafavor",
  "formadepago",
  "lugaryformadepago",
  "expensasordinarias",
  "expensasextraordinarias",
  "interesespormora",
  "fondodereserva",
  "abl",
  "agua",
  "gas",
  "luz",
  "otros",
  "concepto1",
  "importe1",
  "concepto2",
  "importe2",
  "observaciones",
];

const guidedHeaders = [
  ...minimumHeaders.slice(0, minimumHeaders.indexOf("observaciones")),
  "concepto3",
  "importe3",
  "concepto4",
  "importe4",
  "concepto5",
  "importe5",
  "observaciones",
];

const minimumExample = [
  "PIVA Administracion y Servicios",
  "30-71234567-8",
  "RPA 1452",
  "Av. Corrientes 1234, CABA",
  "11-4321-5678",
  "administracion@piva.com.ar",
  "www.piva.com.ar",
  "Juan Perez",
  "Consorcio Torre Norte",
  "Av. Directorio 456, CABA",
  "Caballito",
  "30-70111222-3",
  "https://drive.google.com/consorcio-torre-norte",
  "12",
  "6",
  "B",
  4.75,
  "Maria Gomez",
  "27-30111222-9",
  "11-5555-1111",
  "maria.gomez@email.com",
  "0001-000045",
  "10-06-2026",
  "Junio 2026",
  12000,
  0,
  0,
  "Transferencia",
  "CBU 0000003100000001234567",
  85000,
  12000,
  2500,
  6000,
  4500,
  3800,
  0,
  0,
  1500,
  "Seguro integral",
  3200,
  "Matafuegos",
  1800,
  "Pago hasta el 15/06/2026",
];

const guidedExample1 = [
  "PIVA Administracion y Servicios",
  "30-71234567-8",
  "RPA 1452",
  "Av. Corrientes 1234, CABA",
  "11-4321-5678",
  "administracion@piva.com.ar",
  "www.piva.com.ar",
  "Juan Perez",
  "Consorcio Torre Norte",
  "Av. Directorio 456, CABA",
  "Caballito",
  "30-70111222-3",
  "https://drive.google.com/consorcio-torre-norte",
  "12",
  "6",
  "B",
  4.75,
  "Maria Gomez",
  "27-30111222-9",
  "11-5555-1111",
  "maria.gomez@email.com",
  "0001-000045",
  "10-06-2026",
  "Junio 2026",
  12000,
  0,
  0,
  "Transferencia",
  "CBU 0000003100000001234567",
  85000,
  12000,
  2500,
  6000,
  4500,
  3800,
  0,
  0,
  1500,
  "Seguro integral",
  3200,
  "Matafuegos",
  1800,
  "",
  "",
  "",
  "",
  "",
  "",
  "Pago hasta el 15/06/2026",
];

const guidedExample2 = [
  "PIVA Administracion y Servicios",
  "30-71234567-8",
  "RPA 1452",
  "Av. Corrientes 1234, CABA",
  "11-4321-5678",
  "administracion@piva.com.ar",
  "www.piva.com.ar",
  "Juan Perez",
  "Consorcio Torre Norte",
  "Av. Directorio 456, CABA",
  "Caballito",
  "30-70111222-3",
  "https://drive.google.com/consorcio-torre-norte",
  "18",
  "9",
  "A",
  6.1,
  "Carlos Fernandez",
  "20-22111333-4",
  "11-4444-9999",
  "cfernandez@email.com",
  "0001-000046",
  "10-06-2026",
  "Junio 2026",
  0,
  20000,
  0,
  "Mercado Pago",
  "Alias CONSORCIO.TORRE.NORTE",
  92000,
  0,
  0,
  7500,
  4500,
  3800,
  0,
  0,
  0,
  "Servicio de fumigacion",
  5400,
  "",
  "",
  "Ajuste por reparacion de bomba",
  9500,
  "",
  "",
  "",
  "",
  "Incluye pago parcial ya registrado",
];

const helpRows = [
  ["Columna", "Obligatoria", "Que cargar", "Ejemplo"],
  ["administracion", "Si", "Nombre de la administracion o razon social.", "PIVA Administracion y Servicios"],
  ["cuitadministracion", "Recomendado", "CUIT de la administracion.", "30-71234567-8"],
  ["rpa", "Opcional", "Matricula o registro profesional.", "RPA 1452"],
  ["direccionadministracion", "Recomendado", "Domicilio de la administracion.", "Av. Corrientes 1234, CABA"],
  ["telefonoadministracion", "Opcional", "Telefono de contacto.", "11-4321-5678"],
  ["emailadministracion", "Opcional", "Email de contacto.", "administracion@piva.com.ar"],
  ["websiteadministracion", "Opcional", "Sitio web.", "www.piva.com.ar"],
  ["firmaaclaracion", "Opcional", "Nombre que aparece debajo de la firma.", "Juan Perez"],
  ["consorcio", "Si", "Nombre del edificio o consorcio.", "Consorcio Torre Norte"],
  ["direccionconsorcio", "Si", "Direccion del consorcio.", "Av. Directorio 456, CABA"],
  ["localidadconsorcio", "Opcional", "Barrio, ciudad o localidad.", "Caballito"],
  ["cuitconsorcio", "Opcional", "CUIT del consorcio.", "30-70111222-3"],
  ["urldocumentacion", "Opcional", "Link a Drive o documentacion.", "https://drive.google.com/..."],
  ["uf", "Si", "Numero de unidad funcional.", "12"],
  ["piso", "Opcional", "Piso de la unidad.", "6"],
  ["departamento", "Opcional", "Departamento o letra.", "B"],
  ["porcentajeexpensas", "Opcional", "Coeficiente o porcentaje de expensas.", "4.75"],
  ["propietario", "Si", "Titular, propietario o inquilino.", "Maria Gomez"],
  ["cuitdni", "Opcional", "CUIT o DNI del titular.", "27-30111222-9"],
  ["telefonopropietario", "Opcional", "Telefono del titular.", "11-5555-1111"],
  ["emailpropietario", "Opcional", "Email del titular.", "maria.gomez@email.com"],
  ["numerorecibo", "Si", "Numero de recibo.", "0001-000045"],
  ["fecha", "Si", "Fecha del recibo en formato legible.", "10-06-2026"],
  ["periodo", "Si", "Periodo liquidado.", "Junio 2026"],
  ["saldoanterior", "Opcional", "Saldo pendiente anterior.", "12000"],
  ["pagorealizado", "Opcional", "Pago ya efectuado a descontar.", "20000"],
  ["saldoafavor", "No", "La app lo recalcula; puede dejarse en 0.", "0"],
  ["formadepago", "Opcional", "Efectivo, Transferencia, Mercado Pago, Cheque u Otro.", "Transferencia"],
  ["lugaryformadepago", "Opcional", "CBU, alias, cuenta o detalle.", "CBU 0000003100000001234567"],
  ["expensasordinarias", "Recomendado", "Importe de expensas ordinarias.", "85000"],
  ["expensasextraordinarias", "Opcional", "Importe de expensas extraordinarias.", "12000"],
  ["interesespormora", "Opcional", "Intereses por mora.", "2500"],
  ["fondodereserva", "Opcional", "Fondo de reserva.", "6000"],
  ["abl", "Opcional", "Importe de ABL.", "4500"],
  ["agua", "Opcional", "Importe de agua.", "3800"],
  ["gas", "Opcional", "Importe de gas.", "0"],
  ["luz", "Opcional", "Importe de luz.", "0"],
  ["otros", "Opcional", "Importe general de otros conceptos.", "1500"],
  ["concepto1 / importe1", "Opcional", "Concepto personalizado y su importe.", "Seguro integral / 3200"],
  ["concepto2 / importe2", "Opcional", "Segundo concepto personalizado.", "Matafuegos / 1800"],
  ["concepto3+ / importe3+", "Opcional", "Mas conceptos personalizados en la plantilla guiada.", "Ajuste por reparacion / 9500"],
  ["observaciones", "Opcional", "Notas que se muestran en el recibo.", "Pago hasta el 15/06/2026"],
];

function columnName(index) {
  let current = index + 1;
  let result = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}

function rangeForSize(rowCount, columnCount, startRow = 1, startColumnIndex = 0) {
  const start = `${columnName(startColumnIndex)}${startRow}`;
  const end = `${columnName(startColumnIndex + columnCount - 1)}${startRow + rowCount - 1}`;
  return `${start}:${end}`;
}

function applySheetTheme(sheet, totalColumns, totalRows) {
  const wholeRange = sheet.getRange(rangeForSize(totalRows, totalColumns));
  wholeRange.format = {
    font: { name: "Calibri", size: 11, color: "#1F2937" },
    verticalAlignment: "center",
  };

  const headerRange = sheet.getRange(rangeForSize(1, totalColumns));
  headerRange.format = {
    fill: { type: "solid", color: "#0F4C5C" },
    font: { name: "Calibri", size: 11, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    wrapText: true,
    rowHeightPx: 34,
    borders: { preset: "outside", style: "thin", color: "#0B3340" },
  };

  if (totalRows > 1) {
    const dataRange = sheet.getRange(rangeForSize(totalRows - 1, totalColumns, 2));
    dataRange.format = {
      borders: { preset: "all", style: "thin", color: "#D1D5DB" },
      wrapText: true,
    };
  }

  sheet.freezePanes.freezeRows(1);
}

function setColumnWidths(sheet, headers, widthByHeader, defaultWidthPx = 130) {
  headers.forEach((header, index) => {
    const width = widthByHeader[header] ?? defaultWidthPx;
    const columnRange = sheet.getRange(`${columnName(index)}:${columnName(index)}`);
    columnRange.format.columnWidthPx = width;
  });
}

function setMoneyFormat(sheet, headers, rowCount) {
  const moneyHeaders = new Set([
    "saldoanterior",
    "pagorealizado",
    "saldoafavor",
    "expensasordinarias",
    "expensasextraordinarias",
    "interesespormora",
    "fondodereserva",
    "abl",
    "agua",
    "gas",
    "luz",
    "otros",
    "importe1",
    "importe2",
    "importe3",
    "importe4",
    "importe5",
  ]);

  headers.forEach((header, index) => {
    if (!moneyHeaders.has(header)) return;
    sheet.getRange(`${columnName(index)}2:${columnName(index)}${rowCount}`).format.numberFormat = "#,##0.00";
  });

  const percentageIndex = headers.indexOf("porcentajeexpensas");
  if (percentageIndex >= 0) {
    sheet.getRange(`${columnName(percentageIndex)}2:${columnName(percentageIndex)}${rowCount}`).format.numberFormat = "0.00";
  }
}

function addPaymentValidation(sheet, headers, rowCount) {
  const paymentIndex = headers.indexOf("formadepago");
  if (paymentIndex < 0) return;
  sheet.getRange(`${columnName(paymentIndex)}2:${columnName(paymentIndex)}${rowCount}`).dataValidation = {
    allowBlank: true,
    list: {
      inCellDropDown: true,
      source: ["Transferencia", "Efectivo", "Mercado Pago", "Cheque", "Otro"],
    },
  };
}

function buildTemplateSheet(workbook, sheetName, headers, rows, widths) {
  const sheet = workbook.worksheets.add(sheetName);
  const matrix = [headers, ...rows];
  sheet.getRange(rangeForSize(matrix.length, headers.length)).values = matrix;
  applySheetTheme(sheet, headers.length, matrix.length);
  setColumnWidths(sheet, headers, widths);
  setMoneyFormat(sheet, headers, matrix.length);
  addPaymentValidation(sheet, headers, Math.max(matrix.length, 200));
  return sheet;
}

function buildHelpSheet(workbook) {
  const sheet = workbook.worksheets.add("Ayuda");
  sheet.getRange(rangeForSize(helpRows.length, helpRows[0].length)).values = helpRows;
  applySheetTheme(sheet, helpRows[0].length, helpRows.length);
  sheet.getRange("A2:D42").format = {
    borders: { preset: "all", style: "thin", color: "#D1D5DB" },
    wrapText: true,
    verticalAlignment: "top",
  };
  sheet.getRange("A:A").format.columnWidthPx = 180;
  sheet.getRange("B:B").format.columnWidthPx = 105;
  sheet.getRange("C:C").format.columnWidthPx = 320;
  sheet.getRange("D:D").format.columnWidthPx = 260;
  sheet.freezePanes.freezeRows(1);
  return sheet;
}

async function saveWorkbook(workbook, fileName) {
  const output = await SpreadsheetFile.exportXlsx(workbook);
  const fullPath = path.join(outputDir, fileName);
  await output.save(fullPath);
  return fullPath;
}

async function renderPreview(workbook, sheetName, range, fileName) {
  const preview = await workbook.render({
    sheetName,
    range,
    format: "png",
    scale: 1.5,
  });
  const fullPath = path.join(outputDir, fileName);
  const buffer = Buffer.from(await preview.arrayBuffer());
  await fs.writeFile(fullPath, buffer);
  return fullPath;
}

async function inspectWorkbook(workbook, sheetName, range) {
  return workbook.inspect({
    kind: "table",
    range: `${sheetName}!${range}`,
    include: "values",
    tableMaxRows: 10,
    tableMaxCols: 20,
  });
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const widths = {
    administracion: 210,
    direccionadministracion: 220,
    emailadministracion: 210,
    websiteadministracion: 190,
    consorcio: 180,
    direccionconsorcio: 220,
    localidadconsorcio: 130,
    urldocumentacion: 240,
    propietario: 170,
    emailpropietario: 210,
    fecha: 95,
    periodo: 110,
    lugaryformadepago: 220,
    observaciones: 220,
  };

  const minimumWorkbook = Workbook.create();
  buildTemplateSheet(minimumWorkbook, "Carga", minimumHeaders, [minimumExample], widths);
  const minimumPath = await saveWorkbook(
    minimumWorkbook,
    "plantilla-consorcio-minima.xlsx",
  );

  const guidedWorkbook = Workbook.create();
  buildTemplateSheet(
    guidedWorkbook,
    "Carga",
    guidedHeaders,
    [guidedExample1, guidedExample2],
    widths,
  );
  buildHelpSheet(guidedWorkbook);
  const guidedPath = await saveWorkbook(
    guidedWorkbook,
    "plantilla-consorcio-guiada.xlsx",
  );

  const minimumInspect = await inspectWorkbook(minimumWorkbook, "Carga", "A1:T3");
  const guidedInspect = await inspectWorkbook(guidedWorkbook, "Carga", "A1:V4");
  const helpInspect = await inspectWorkbook(guidedWorkbook, "Ayuda", "A1:D8");
  const previewPath = await renderPreview(
    guidedWorkbook,
    "Carga",
    "A1:AV4",
    "plantilla-consorcio-guiada-preview.png",
  );

  console.log(JSON.stringify({
    minimumPath,
    guidedPath,
    previewPath,
    minimumInspect: minimumInspect.ndjson,
    guidedInspect: guidedInspect.ndjson,
    helpInspect: helpInspect.ndjson,
  }, null, 2));
}

await main();
