import QRCode from "qrcode";

export function getConsortiumDocumentUrl(consortium) {
  const raw = consortium?.documentUrl;
  return typeof raw === "string" ? raw.trim() : "";
}

export function getQrSectionHeight(documentUrl) {
  return documentUrl ? 35 : 0;
}

export async function buildPdfQrImageDataUrl(documentUrl) {
  if (!documentUrl) return null;

  return QRCode.toDataURL(documentUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 180,
    color: {
      dark: "#083D55",
      light: "#FFFFFF",
    },
  });
}

export function getQrSectionSummary(documentUrl) {
  if (!documentUrl) return null;

  return {
    height: getQrSectionHeight(documentUrl),
    title: "DOCUMENTACION DEL EDIFICIO",
    description: "Escanea el QR para acceder a la documentacion del consorcio.",
    bullets: [
      "Liquidaciones y recibos",
      "Actas",
      "Reglamento",
      "Seguros",
      "Mantenimiento",
    ],
    notes: [
      "Este recibo corresponde al pago registrado para la unidad indicada.",
      "El detalle completo de la liquidacion se encuentra en la expensa mensual enviada.",
    ],
    documentUrl,
  };
}
