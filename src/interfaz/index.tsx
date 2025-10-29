export interface Utilities {
  edenor?: number | "";
  gas?: number | "";
  agua?: number | "";
  expensas?: number | "";
  abl?: number | "";
}

export interface ReceiptData {
  cliente: string;
  direccion: string;
  iva: string;
  cuiltDni: string;
  localidad: string;

  contrato: string;
  inicio: string; // YYYY-MM-DD
  finalizacion: string; // YYYY-MM-DD
  enConceptoDe: string; // e.g., "Locación de inmueble"
  direccionInmueble: string;
  propietario: string;
  mesCorrespondiente: string; // e.g., "Marzo 2025"

  alquiler: number | "";
  aumentoPorcentual: number | ""; // e.g., 3 for 3%
  aproximado: boolean;

  otrosConceptos: string;
  observaciones: string;
  utilities: Utilities;
}


export type UtilityKeys = "edenor" | "gas" | "agua" | "expensas" | "abl";
