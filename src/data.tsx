import type {
  AdministrationSettings,
  Consortium,
  ExpenseReceipt,
  Owner,
  ReceiptData,
  Unit,
} from "./interfaz";

export const INIT_DATA: ReceiptData = {
  codigo: "",
  fecha: "",
  cliente: "",
  direccion: "",
  iva: "",
  cuiltDni: "",
  localidad: "",
  contrato: "",
  inicio: "",
  finalizacion: "",
  enConceptoDe: "",
  direccionInmueble: "",
  propietario: "",
  dniPropietario: "",
  mesCorrespondiente: "",
  alquiler: "",
  aumentoPorcentual: 0,
  aproximado: false,
  otrosConceptos: "",
  observaciones: "",
  utilities: { edenor: "", gas: "", agua: "", expensas: "", abl: "", cochera: "" },
  diferencia: "",
  hayDiferencia: false,
  tipoAjuste: "",
  numeroRecibo: "",
  totalRecibos: "",
  punitorios: "",
  hayPunitorios: false,
};

export const CONSORTIUM_ADMINISTRATION_INIT: AdministrationSettings = {
  id: "consorcio-admin-default",
  logo: "",
  razonSocial: "PIVA Administracion y Servicios",
  cuit: "",
  rpa: "",
  direccion: "",
  telefono: "",
  email: "",
  firmaUrl: "",
  firmaAclaracion: "",
};

export const CONSORTIUMS_INIT: Consortium[] = [];

export const CONSORTIUM_UNITS_INIT: Unit[] = [];

export const CONSORTIUM_OWNERS_INIT: Owner[] = [];

export const CONSORTIUM_INIT_DATA: ExpenseReceipt = {
  id: "",
  receiptNumber: "",
  date: "",
  period: "",
  consortiumId: "",
  unitId: "",
  ownerId: "",
  accountStatus: {
    saldoAnterior: "",
    pagoRealizado: "",
    saldoAFavor: "",
  },
  paymentMethod: "Transferencia",
  paymentDetails: "",
  totalAmount: 0,
  notes: "",
  status: "draft",
  concepts: [{ id: "concept-1", description: "", amount: "" }],
};
