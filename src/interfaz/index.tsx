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

export type ReceiptType = "INMOBILIARIA" | "CONSORCIO";

export interface AdministrationSettings {
  id: string;
  logo: string;
  razonSocial: string;
  cuit: string;
  rpa: string;
  direccion: string;
  telefono: string;
  email: string;
  website: string;
  firmaUrl: string;
  firmaAclaracion: string;
}

export interface Consortium {
  id: string;
  nombre: string;
  direccion: string;
  localidad: string;
  cuit: string;
  documentUrl: string;
}

export interface Unit {
  id: string;
  consortiumId: string;
  numeroUF: string;
  piso: string;
  departamento: string;
  porcentajeExpensas: number | "";
}

export interface Owner {
  id: string;
  nombre: string;
  cuitDni: string;
  telefono: string;
  email: string;
}

export interface ExpenseAccountStatus {
  saldoAnterior: number | "";
  pagoRealizado: number | "";
  saldoAFavor: number | "";
}

export type PaymentMethod =
  | "Efectivo"
  | "Transferencia"
  | "Mercado Pago"
  | "Cheque"
  | "Otro";

export interface ExpenseReceiptConcept {
  id: string;
  description: string;
  amount: number | "";
}

export interface ExpenseReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  period: string;
  consortiumId: string;
  unitId: string;
  ownerId: string;
  accountStatus: ExpenseAccountStatus;
  paymentMethod: PaymentMethod;
  paymentDetails: string;
  totalAmount: number;
  notes: string;
  status: "draft";
  concepts: ExpenseReceiptConcept[];
}

export interface ConsortiumWorkbookData {
  administration: AdministrationSettings;
  consortiums: Consortium[];
  units: Unit[];
  owners: Owner[];
  receipts: ExpenseReceipt[];
}
