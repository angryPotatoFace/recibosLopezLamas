export interface Utilities {
  edenor?: number | "";
  gas?: number | "";
  agua?: number | "";
  expensas?: number | "";
  abl?: number | "";
  cochera?: number | "";
}

export interface ReceiptData {
  codigo: string;
  fecha: string; // DD-MM-YYYY
  numeroRecibo: string,
  totalRecibos: string,

  cliente: string;
  direccion: string;
  iva: string;
  cuiltDni: string;
  localidad: string;

  contrato: string;
  inicio: string; // DD-MM-YYYY
  finalizacion: string; // DD-MM-YYYY
  enConceptoDe: string; // e.g., "Locación de inmueble"
  direccionInmueble: string;
  propietario: string;
  dniPropietario: string;
  mesCorrespondiente: string; // e.g., "Marzo 2025"

  alquiler: number | "";
  diferencia: number | "";
  punitorios: number | "";
  aumentoPorcentual: number | ""; // e.g., 3 for 3%
  aproximado: boolean;
  hayDiferencia: boolean;
  hayPunitorios: boolean;


  otrosConceptos: string;
  observaciones: string;
  tipoAjuste: string;
  utilities: Utilities;
}


export type UtilityKeys = "edenor" | "gas" | "agua" | "expensas" | "abl" | "cochera";
