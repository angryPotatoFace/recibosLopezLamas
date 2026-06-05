import {
  CONSORTIUM_ADMINISTRATION_INIT,
  CONSORTIUM_INIT_DATA,
  CONSORTIUM_OWNERS_INIT,
  CONSORTIUM_UNITS_INIT,
  CONSORTIUMS_INIT,
} from "./data";
import type {
  AdministrationSettings,
  Consortium,
  ExpenseReceipt,
  Owner,
  Unit,
} from "./interfaz";

export const CONSORTIUM_STORAGE_KEYS = {
  administration: "recibos_llamas_consorcio_administration",
  consortiums: "recibos_llamas_consorcio_consortiums",
  units: "recibos_llamas_consorcio_units",
  owners: "recibos_llamas_consorcio_owners",
  receipts: "recibos_llamas_consorcio_receipts",
} as const;

function readStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function writeStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadAdministrationSettings(): AdministrationSettings {
  return readStorage(
    CONSORTIUM_STORAGE_KEYS.administration,
    CONSORTIUM_ADMINISTRATION_INIT,
  );
}

export function saveAdministrationSettings(data: AdministrationSettings) {
  writeStorage(CONSORTIUM_STORAGE_KEYS.administration, data);
}

export function loadConsortiums(): Consortium[] {
  return readStorage(CONSORTIUM_STORAGE_KEYS.consortiums, CONSORTIUMS_INIT);
}

export function saveConsortiums(data: Consortium[]) {
  writeStorage(CONSORTIUM_STORAGE_KEYS.consortiums, data);
}

export function loadUnits(): Unit[] {
  return readStorage(CONSORTIUM_STORAGE_KEYS.units, CONSORTIUM_UNITS_INIT);
}

export function saveUnits(data: Unit[]) {
  writeStorage(CONSORTIUM_STORAGE_KEYS.units, data);
}

export function loadOwners(): Owner[] {
  return readStorage(CONSORTIUM_STORAGE_KEYS.owners, CONSORTIUM_OWNERS_INIT);
}

export function saveOwners(data: Owner[]) {
  writeStorage(CONSORTIUM_STORAGE_KEYS.owners, data);
}

export function loadExpenseReceipts(): ExpenseReceipt[] {
  return readStorage(CONSORTIUM_STORAGE_KEYS.receipts, []);
}

export function saveExpenseReceipts(data: ExpenseReceipt[]) {
  writeStorage(CONSORTIUM_STORAGE_KEYS.receipts, data);
}

export function createExpenseReceiptDraft(): ExpenseReceipt {
  return {
    ...CONSORTIUM_INIT_DATA,
    accountStatus: { ...CONSORTIUM_INIT_DATA.accountStatus },
    concepts: CONSORTIUM_INIT_DATA.concepts.map((concept) => ({ ...concept })),
  };
}
