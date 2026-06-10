export interface QrSectionSummary {
  height: number;
  title: string;
  description: string;
  bullets: string[];
  notes: [string, string];
  documentUrl: string;
}

export function getConsortiumDocumentUrl(
  consortium?: { documentUrl?: string | null } | null,
): string;

export function getQrSectionHeight(documentUrl: string): number;

export function buildPdfQrImageDataUrl(
  documentUrl: string,
): Promise<string | null>;

export function getQrSectionSummary(
  documentUrl: string,
): QrSectionSummary | null;
