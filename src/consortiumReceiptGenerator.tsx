/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ConsortiumReceiptPreview from "./consortiumReceiptPreview";
import { generateConsortiumReceiptPdf } from "./consortiumReceiptPdfTemplate";
import {
  createExpenseReceiptDraft,
  loadAdministrationSettings,
  loadConsortiums,
  loadExpenseReceipts,
  loadOwners,
  loadUnits,
  saveAdministrationSettings,
  saveConsortiums,
  saveExpenseReceipts,
  saveOwners,
  saveUnits,
} from "./consortiumStorage";
import {
  fromExcelHeader,
  money,
  NumberInput,
  parseBoolLike,
  Text,
  TextArea,
} from "./helpers";
import type {
  AdministrationSettings,
  Consortium,
  ExpenseAccountStatementConcept,
  ExpenseReceipt,
  ExpenseReceiptConcept,
  Owner,
  PaymentMethod,
  Unit,
} from "./interfaz";
import {
  formatAccountStatementAmount,
  parseAccountStatementAmount,
} from "./consortiumReceiptView";

const DEFAULT_PAYMENT_METHOD: PaymentMethod = "Transferencia";

const CONCEPT_HEADER_MAP = [
  { key: "expensasordinarias", label: "Expensas Ord." },
  { key: "expensasord", label: "Expensas Ord." },
  { key: "expensasextraordinarias", label: "Expensas Ext." },
  { key: "expensasext", label: "Expensas Ext." },
  { key: "fondodereserva", label: "Fondo de reserva" },
  { key: "abl", label: "ABL" },
  { key: "agua", label: "Agua" },
  { key: "gas", label: "Gas" },
  { key: "luz", label: "Luz" },
  { key: "otros", label: "Otros" },
];

type ExpenseErrors = Partial<
  Record<"administration" | "consortium" | "unit" | "owner" | "date" | "period" | "concepts" | "totalAmount", string>
> & {
  conceptRows?: Record<string, { description?: string; amount?: string }>;
  monthlyConceptRows?: Record<string, { description?: string; amount?: string }>;
};

function parseNumber(value: unknown): number | "" {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : "";
  }

  const raw = String(value).trim();
  if (!raw) return "";

  const cleaned = raw
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized = cleaned;

  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(",", ".");
  }

  const nextValue = Number(normalized);
  return Number.isFinite(nextValue) ? nextValue : "";
}

function getFirstValue(
  row: Record<string, unknown>,
  aliases: string[],
  fallback = "",
) {
  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

function excelDateToString(value: unknown): string {
  let date: Date | null = null;

  if (typeof value === "number" && !Number.isNaN(value)) {
    date = new Date(Math.round((value - 25569) * 86400 * 1000));
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  } else if (value instanceof Date) {
    date = new Date(value.getTime() + value.getTimezoneOffset() * 60000);
  } else if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      date = new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000);
    } else {
      return value;
    }
  }

  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function toId(parts: Array<string | number | undefined>) {
  return parts
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || crypto.randomUUID();
}

function createConcept(description = "", amount: number | "" = ""): ExpenseReceiptConcept {
  return {
    id: crypto.randomUUID(),
    description,
    amount,
  };
}

function createStatementConcept(
  description = "",
  amount = "",
): ExpenseAccountStatementConcept {
  return {
    id: crypto.randomUUID(),
    description,
    amount,
  };
}

function normalizeStatementConcept(
  concept: ExpenseAccountStatementConcept,
): ExpenseAccountStatementConcept {
  return {
    ...concept,
    description: concept.description.trim(),
    amount: concept.amount.trim(),
  };
}

function normalizeStatementConcepts(concepts: ExpenseAccountStatementConcept[]) {
  return concepts.map(normalizeStatementConcept);
}

function normalizeLegacyConcept(concept: ExpenseReceiptConcept): ExpenseReceiptConcept {
  return {
    ...concept,
    description: concept.description.trim(),
    amount: parseNumber(concept.amount),
  };
}

function normalizeLegacyConcepts(concepts: ExpenseReceiptConcept[]) {
  return concepts.map(normalizeLegacyConcept);
}

function syncLegacyConcepts(
  monthlyConcepts: ExpenseAccountStatementConcept[],
): ExpenseReceiptConcept[] {
  const nextConcepts = monthlyConcepts
    .map((concept) => ({
      id: concept.id,
      description: concept.description.trim(),
      amount: parseNumber(concept.amount),
    }))
    .filter((concept) => concept.description || concept.amount !== "");

  return nextConcepts.length > 0 ? nextConcepts : [createConcept()];
}

function cloneReceipt(receipt: ExpenseReceipt): ExpenseReceipt {
  const draft = createExpenseReceiptDraft();
  const migratedMonthlyConcepts =
    receipt.accountStatement?.monthlyConcepts?.length
      ? receipt.accountStatement.monthlyConcepts
      : receipt.concepts?.length
        ? receipt.concepts.map((concept) =>
            createStatementConcept(
              concept.description,
              concept.amount === "" ? "" : money(Number(concept.amount)) || "",
            ),
          )
        : draft.accountStatement.monthlyConcepts;

  return {
    ...draft,
    ...receipt,
    poseeDeuda: receipt.poseeDeuda ?? draft.poseeDeuda,
    accountStatus: {
      ...draft.accountStatus,
      ...receipt.accountStatus,
    },
    concepts: normalizeLegacyConcepts(receipt.concepts || draft.concepts).map((concept) => ({
      ...concept,
    })),
    accountStatement: {
      ...draft.accountStatement,
      ...receipt.accountStatement,
      monthlyConcepts: normalizeStatementConcepts(
        migratedMonthlyConcepts,
      ).map((concept) => ({ ...concept })),
      totalToPay:
        receipt.accountStatement?.totalToPay?.trim() ||
        (receipt.totalAmount ? money(receipt.totalAmount) || "" : ""),
      paymentMade:
        receipt.accountStatement?.paymentMade?.trim() ||
        (receipt.accountStatus?.pagoRealizado !== ""
          ? money(Number(receipt.accountStatus?.pagoRealizado || 0)) || ""
          : ""),
      historicDebt:
        receipt.accountStatement?.historicDebt?.trim() ||
        (receipt.accountStatus?.saldoAnterior !== ""
          ? money(Number(receipt.accountStatus?.saldoAnterior || 0)) || ""
          : ""),
      difference:
        receipt.accountStatement?.difference?.trim() ||
        (receipt.totalAmount ? money(receipt.totalAmount) || "" : ""),
    },
  };
}

function createBlankConsortium(): Consortium {
  const id = crypto.randomUUID();
  return {
    id,
    nombre: "",
    direccion: "",
    localidad: "",
    cuit: "",
    documentUrl: "",
  };
}

function createBlankUnit(consortiumId = ""): Unit {
  return {
    id: crypto.randomUUID(),
    consortiumId,
    numeroUF: "",
    piso: "",
    departamento: "",
    porcentajeExpensas: "",
  };
}

function createBlankOwner(): Owner {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cuitDni: "",
    telefono: "",
    email: "",
  };
}

function createReceiptFromDraft(): ExpenseReceipt {
  const draft = createExpenseReceiptDraft();
  return cloneReceipt({
    ...draft,
    id: crypto.randomUUID(),
    concepts: [createConcept()],
    accountStatement: {
      ...draft.accountStatement,
      monthlyConcepts: [createStatementConcept()],
    },
  });
}

function mergeUnique<T extends { id: string }>(current: T[], incoming: T[]) {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return [...map.values()];
}

function validateReceipt(receipt: ExpenseReceipt): ExpenseErrors {
  const errors: ExpenseErrors = {};
  const monthlyConceptRows: Record<string, { description?: string; amount?: string }> = {};
  const normalizedReceipt = cloneReceipt(receipt);
  const validConcepts = normalizedReceipt.accountStatement.monthlyConcepts.filter(
    (concept) => concept.description.trim() || concept.amount !== "",
  );

  if (!receipt.consortiumId) errors.consortium = "Selecciona un consorcio.";
  if (!receipt.unitId) errors.unit = "Selecciona una unidad funcional.";
  if (!receipt.ownerId) errors.owner = "Selecciona un propietario.";
  if (!receipt.date.trim()) errors.date = "La fecha es obligatoria.";
  if (!receipt.period.trim()) errors.period = "El periodo es obligatorio.";
  if (validConcepts.length === 0) errors.concepts = "Debes cargar al menos un concepto.";

  normalizedReceipt.accountStatement.monthlyConcepts.forEach((concept) => {
    const rowErrors: { description?: string; amount?: string } = {};
    if (concept.description.trim() || concept.amount !== "") {
      if (!concept.description.trim()) rowErrors.description = "Ingresa un concepto.";
      if (!concept.amount.trim()) rowErrors.amount = "Ingresa un importe.";
    }
    if (rowErrors.description || rowErrors.amount) {
      monthlyConceptRows[concept.id] = rowErrors;
    }
  });

  if (Object.keys(monthlyConceptRows).length > 0) errors.monthlyConceptRows = monthlyConceptRows;
  if (!normalizedReceipt.accountStatement.totalToPay.trim()) {
    errors.totalAmount = "Ingresa el total a pagar.";
  }

  return errors;
}

function parsePaymentMethod(value: unknown): PaymentMethod {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("efectivo")) return "Efectivo";
  if (normalized.includes("mercado")) return "Mercado Pago";
  if (normalized.includes("cheque")) return "Cheque";
  if (normalized.includes("trans")) return "Transferencia";
  return normalized ? "Otro" : DEFAULT_PAYMENT_METHOD;
}

function parseDebtFlag(value: unknown) {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      [
        "poseedeuda",
        "posee deuda",
        "verdadero",
        "si",
        "sí",
        "true",
        "1",
      ].includes(normalized)
    ) {
      return true;
    }
    if (
      [
        "sindeuda",
        "sin deuda",
        "falso",
        "no",
        "false",
        "0",
      ].includes(normalized)
    ) {
      return false;
    }
  }

  return parseBoolLike(value);
}

function formatImportedAmount(value: unknown) {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "number") return money(value);
  const raw = String(value).trim();
  if (!raw) return "";

  const parsed = parseNumber(raw);
  return parsed === "" ? raw : raw;
}

function buildMonthlyConcepts(
  row: Record<string, unknown>,
): ExpenseAccountStatementConcept[] {
  const concepts: ExpenseAccountStatementConcept[] = [];

  CONCEPT_HEADER_MAP.forEach(({ key, label }) => {
    const amount = formatImportedAmount(
      getFirstValue(row, [
        key,
        key.replace(/\./g, ""),
        key.replace(/\s/g, ""),
      ]),
    );
    if (amount && parseAccountStatementAmount(amount) !== 0) {
      concepts.push(createStatementConcept(label, amount));
    }
  });

  for (let index = 1; index <= 12; index += 1) {
    const description =
      String(
        getFirstValue(row, [
          `concepto${index}`,
          `concepto_${index}`,
          `descripcion${index}`,
          `descripcion_${index}`,
          `detalle${index}`,
          `detalle_${index}`,
        ]),
      ).trim();
    const amount = formatImportedAmount(
      getFirstValue(row, [
        `importe${index}`,
        `importe_${index}`,
        `monto${index}`,
        `monto_${index}`,
        `valor${index}`,
        `valor_${index}`,
      ]),
    );

    if (description || amount) {
      concepts.push(createStatementConcept(description || `Concepto ${index}`, amount));
    }
  }

  const genericDescription = String(
    getFirstValue(row, ["concepto", "descripcion", "detalle"]),
  ).trim();
  const genericAmount = formatImportedAmount(
    getFirstValue(row, ["importe", "monto", "valor"]),
  );
  if (genericDescription || genericAmount) {
    concepts.push(createStatementConcept(genericDescription || "Concepto", genericAmount));
  }

  if (concepts.length === 0) {
    const total = formatImportedAmount(row.total);
    if (total) {
      concepts.push(createStatementConcept("Expensas", total));
    }
  }

  return concepts.length > 0 ? concepts : [createStatementConcept()];
}

function parseWorkbookRows(rows: any[], currentAdministration: AdministrationSettings) {
  if (!rows.length) return null;

  const normalizedRows = rows.map((row) => {
    const nextRow: Record<string, unknown> = {};
    Object.entries(row).forEach(([key, value]) => {
      nextRow[fromExcelHeader(key)] = value;
    });
    return nextRow;
  });

  const firstRow = normalizedRows[0];

  const administration: AdministrationSettings = {
    ...currentAdministration,
    razonSocial:
      String(
        getFirstValue(firstRow, [
          "administracion",
          "nombreadministracion",
          "razonsocial",
          "administrador",
        ]) ??
          currentAdministration.razonSocial,
      ) || currentAdministration.razonSocial,
    cuit: String(
      getFirstValue(firstRow, ["cuitadministracion", "cuitadmin", "cuit"], currentAdministration.cuit),
    ),
    rpa: String(getFirstValue(firstRow, ["rpa", "matricula"], currentAdministration.rpa)),
    direccion: String(
      getFirstValue(firstRow, [
        "direccionadministracion",
        "direccionadmin",
        "domicilioadministracion",
      ]) ??
        currentAdministration.direccion,
    ),
    telefono: String(
      getFirstValue(firstRow, ["telefonoadministracion", "telefonoadmin", "telefono"], currentAdministration.telefono),
    ),
    email: String(
      getFirstValue(firstRow, ["emailadministracion", "emailadmin", "email"], currentAdministration.email),
    ),
    website: String(
      getFirstValue(firstRow, ["websiteadministracion", "website", "sitio", "web"], currentAdministration.website),
    ),
    firmaAclaracion: String(
      getFirstValue(firstRow, ["firmaaclaracion"], currentAdministration.firmaAclaracion),
    ),
  };

  const consortiumsMap = new Map<string, Consortium>();
  const unitsMap = new Map<string, Unit>();
  const ownersMap = new Map<string, Owner>();
  const receipts: ExpenseReceipt[] = [];

  normalizedRows.forEach((row, index) => {
    const consortiumName = String(
      getFirstValue(row, ["consorcio", "nombreconsorcio", "edificio"]),
    ).trim();
    const consortiumAddress = String(
      getFirstValue(row, [
        "direccionconsorcio",
        "consorciodireccion",
        "domicilioconsorcio",
        "direccion",
      ]),
    ).trim();
    const consortiumLocation = String(
      getFirstValue(row, ["localidadconsorcio", "localidad", "ciudad"]),
    ).trim();
    const consortiumId = toId([consortiumName, consortiumAddress, consortiumLocation]);

    const consortium: Consortium = {
      id: consortiumId,
      nombre: consortiumName || `Consorcio ${index + 1}`,
      direccion: consortiumAddress,
      localidad: consortiumLocation,
      cuit: String(
        getFirstValue(row, ["cuitconsorcio", "cuitedificio", "cuitcons"]),
      ),
      documentUrl: String(
        getFirstValue(row, ["urldocumentacion", "driveconsorcio", "documentosconsorcio", "documenturl", "driveurl"]),
      ),
    };
    consortiumsMap.set(consortium.id, consortium);

    const unitNumber = String(
      getFirstValue(row, ["uf", "numerouf", "unidadfuncional", "unidad"]),
    ).trim();
    const unitFloor = String(getFirstValue(row, ["piso"])).trim();
    const unitDepartment = String(
      getFirstValue(row, ["departamento", "depto", "dpto"]),
    ).trim();
    const unitId = toId([consortiumId, unitNumber, unitFloor, unitDepartment]);
    const unit: Unit = {
      id: unitId,
      consortiumId,
      numeroUF: unitNumber,
      piso: unitFloor,
      departamento: unitDepartment,
      porcentajeExpensas: parseNumber(
        getFirstValue(row, ["porcentajeexpensas", "porcentaje", "coeficiente"]),
      ),
    };
    unitsMap.set(unit.id, unit);

    const ownerName = String(
      getFirstValue(row, [
        "propietario",
        "nombrepropietario",
        "inquilino",
        "nombreinquilino",
      ]),
    ).trim();
    const ownerTaxId = String(
      getFirstValue(row, [
        "cuitdni",
        "cuitpropietario",
        "dnipropietario",
        "cuitinquilino",
        "dniinquilino",
      ]),
    ).trim();
    const ownerId = toId([ownerName, ownerTaxId]);
    const owner: Owner = {
      id: ownerId,
      nombre: ownerName,
      cuitDni: ownerTaxId,
      telefono: String(
        getFirstValue(row, ["telefonopropietario", "telefonoinquilino", "telefono"]),
      ),
      email: String(
        getFirstValue(row, ["emailpropietario", "emailinquilino", "email"]),
      ),
    };
    ownersMap.set(owner.id, owner);

    const monthlyConcepts = buildMonthlyConcepts(row);
    const normalizedMonthlyConcepts = normalizeStatementConcepts(monthlyConcepts);
    const draftReceipt = {
      id: crypto.randomUUID(),
      receiptNumber: String(
        getFirstValue(row, ["numerorecibo", "recibo", "nrorecibo", "numero"], String(index + 1)),
      ),
      date: excelDateToString(getFirstValue(row, ["fecha", "fecharecibo"])),
      period: String(getFirstValue(row, ["periodo", "mes", "periodoliquidado"])),
      consortiumId,
      unitId,
      ownerId,
      accountStatus: {
        saldoAnterior: parseNumber(
          getFirstValue(row, ["saldoanterior", "saldo", "saldodeudor"]),
        ),
        pagoRealizado: parseNumber(
          getFirstValue(row, ["pagorealizado", "supago", "pago"]),
        ),
        saldoAFavor: parseNumber(getFirstValue(row, ["saldoafavor", "favor"])),
      },
      paymentMethod: parsePaymentMethod(
        getFirstValue(row, ["formadepago", "metododepago", "mediodepago"]),
      ),
      paymentDetails: String(
        getFirstValue(
          row,
          ["lugaryformadepago", "formapago", "detallepago", "lugarpago"],
          "Cuenta corriente",
        ),
      ),
      totalAmount: parseAccountStatementAmount(
        formatImportedAmount(
          getFirstValue(row, ["totalapagar", "total_a_pagar", "total", "totalfinal"]),
        ),
      ),
      poseeDeuda: parseDebtFlag(
        getFirstValue(row, ["poseedeuda", "estadofinal", "tienedeuda", "deudapendiente"]),
      ),
      notes: String(getFirstValue(row, ["observaciones", "nota", "notas"])),
      status: "draft" as const,
      concepts: syncLegacyConcepts(normalizedMonthlyConcepts),
      accountStatement: {
        monthlyConcepts: normalizedMonthlyConcepts,
        historicDebt: formatImportedAmount(
          getFirstValue(row, ["deuda", "historicodeladeuda", "deudahistorica", "saldodeudor"]),
        ),
        interest: formatImportedAmount(
          getFirstValue(row, ["intereses", "interes", "interesespormora", "interesesmora"]),
        ),
        totalToPay: formatImportedAmount(
          getFirstValue(row, ["totalapagar", "total_a_pagar", "total", "totalfinal"]),
        ),
        paymentMade: formatImportedAmount(
          getFirstValue(row, ["pagorealizado", "supago", "pago"]),
        ),
        difference: formatImportedAmount(
          getFirstValue(row, ["diferencia", "saldoafavor", "favor"]),
        ),
      },
    };

    receipts.push(cloneReceipt(draftReceipt));
  });

  return {
    administration,
    consortiums: [...consortiumsMap.values()],
    units: [...unitsMap.values()],
    owners: [...ownersMap.values()],
    receipts,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

function FileField({
  label,
  onFileChange,
}: {
  label: string;
  onFileChange: (file: File) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
      <input
        type="file"
        accept="image/*"
        className="w-full rounded-xl border px-3 py-2"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileChange(file);
        }}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ConsortiumReceiptGenerator() {
  const [administration, setAdministration] = useState<AdministrationSettings>(() =>
    loadAdministrationSettings(),
  );
  const [consortiums, setConsortiums] = useState<Consortium[]>(() => loadConsortiums());
  const [units, setUnits] = useState<Unit[]>(() => loadUnits());
  const [owners, setOwners] = useState<Owner[]>(() => loadOwners());
  const [savedReceipts, setSavedReceipts] = useState<ExpenseReceipt[]>(() =>
    loadExpenseReceipts().map((item) => cloneReceipt(item)),
  );
  const [receipt, setReceipt] = useState<ExpenseReceipt>(() => {
    const saved = loadExpenseReceipts().map((item) => cloneReceipt(item));
    return saved[0] ?? createReceiptFromDraft();
  });
  const [errors, setErrors] = useState<ExpenseErrors>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    saveAdministrationSettings(administration);
  }, [administration]);

  useEffect(() => {
    saveConsortiums(consortiums);
  }, [consortiums]);

  useEffect(() => {
    saveUnits(units);
  }, [units]);

  useEffect(() => {
    saveOwners(owners);
  }, [owners]);

  useEffect(() => {
    saveExpenseReceipts(savedReceipts);
  }, [savedReceipts]);

  const filteredUnits = useMemo(
    () => units.filter((unit) => unit.consortiumId === receipt.consortiumId),
    [receipt.consortiumId, units],
  );

  const selectedConsortium = useMemo(
    () => consortiums.find((item) => item.id === receipt.consortiumId),
    [consortiums, receipt.consortiumId],
  );

  const selectedUnit = useMemo(
    () => units.find((item) => item.id === receipt.unitId),
    [receipt.unitId, units],
  );

  const selectedOwner = useMemo(
    () => owners.find((item) => item.id === receipt.ownerId),
    [owners, receipt.ownerId],
  );

  const totalToPayDisplay = useMemo(
    () => formatAccountStatementAmount(receipt.accountStatement.totalToPay),
    [receipt.accountStatement.totalToPay],
  );

  const previewReceipt = useMemo(
    () => cloneReceipt(receipt),
    [receipt],
  );

  function updateAdministration<K extends keyof AdministrationSettings>(
    key: K,
    value: AdministrationSettings[K],
  ) {
    setAdministration((current) => ({ ...current, [key]: value }));
  }

  function updateReceipt<K extends keyof ExpenseReceipt>(key: K, value: ExpenseReceipt[K]) {
    setReceipt((current) => ({ ...current, [key]: value }));
  }

  function updateAccountStatement<K extends keyof ExpenseReceipt["accountStatement"]>(
    key: K,
    value: ExpenseReceipt["accountStatement"][K],
  ) {
    setReceipt((current) => ({
      ...current,
      accountStatement: { ...current.accountStatement, [key]: value },
    }));
  }

  function updateMonthlyConcept(
    id: string,
    key: keyof ExpenseAccountStatementConcept,
    value: string,
  ) {
    setReceipt((current) => {
      const monthlyConcepts = current.accountStatement.monthlyConcepts.map((concept) =>
        concept.id === id ? { ...concept, [key]: value } : concept,
      );

      return {
        ...current,
        concepts: syncLegacyConcepts(monthlyConcepts),
        accountStatement: {
          ...current.accountStatement,
          monthlyConcepts,
        },
      };
    });
  }

  function updateSelectedConsortium<K extends keyof Consortium>(
    key: K,
    value: Consortium[K],
  ) {
    if (!selectedConsortium) return;
    setConsortiums((current) =>
      current.map((item) =>
        item.id === selectedConsortium.id ? { ...item, [key]: value } : item,
      ),
    );
  }

  function updateSelectedUnit<K extends keyof Unit>(key: K, value: Unit[K]) {
    if (!selectedUnit) return;
    setUnits((current) =>
      current.map((item) =>
        item.id === selectedUnit.id ? { ...item, [key]: value } : item,
      ),
    );
  }

  function updateSelectedOwner<K extends keyof Owner>(key: K, value: Owner[K]) {
    if (!selectedOwner) return;
    setOwners((current) =>
      current.map((item) =>
        item.id === selectedOwner.id ? { ...item, [key]: value } : item,
      ),
    );
  }

  async function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(
    file: File,
    key: "logo" | "firmaUrl",
  ) {
    const dataUrl = await readFileAsDataUrl(file);
    updateAdministration(key, dataUrl);
  }

  function handleNewReceipt() {
    setErrors({});
    setFeedback({ type: "info", message: "Recibo reiniciado. Ya podes cargar uno nuevo." });
    const newReceipt = createReceiptFromDraft();
    setReceipt(newReceipt);
  }

  function handleAddConsortium() {
    const consortium = createBlankConsortium();
    setConsortiums((current) => [...current, consortium]);
    setReceipt((current) => ({
      ...current,
      consortiumId: consortium.id,
      unitId: "",
    }));
  }

  function handleAddUnit() {
    const unit = createBlankUnit(receipt.consortiumId);
    setUnits((current) => [...current, unit]);
    setReceipt((current) => ({ ...current, unitId: unit.id }));
  }

  function handleAddOwner() {
    const owner = createBlankOwner();
    setOwners((current) => [...current, owner]);
    setReceipt((current) => ({ ...current, ownerId: owner.id }));
  }

  function handleAddConcept() {
    setReceipt((current) => {
      const nextConcept = createStatementConcept();
      const nextMonthlyConcepts = [
        ...current.accountStatement.monthlyConcepts,
        nextConcept,
      ];

      return {
        ...current,
        accountStatement: {
          ...current.accountStatement,
          monthlyConcepts: nextMonthlyConcepts,
        },
        concepts: syncLegacyConcepts(nextMonthlyConcepts),
      };
    });
  }

  function handleRemoveConcept(id: string) {
    setReceipt((current) => {
      const nextMonthlyConcepts =
        current.accountStatement.monthlyConcepts.length === 1
          ? [createStatementConcept()]
          : current.accountStatement.monthlyConcepts.filter((concept) => concept.id !== id);

      return {
        ...current,
        concepts: syncLegacyConcepts(nextMonthlyConcepts),
        accountStatement: {
          ...current.accountStatement,
          monthlyConcepts: nextMonthlyConcepts,
        },
      };
    });
  }

  function handleSaveReceipt() {
    const nextReceipt = cloneReceipt({
      ...receipt,
      concepts: syncLegacyConcepts(receipt.accountStatement.monthlyConcepts),
      totalAmount: parseAccountStatementAmount(receipt.accountStatement.totalToPay),
    });
    const nextErrors = validateReceipt(nextReceipt);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        type: "error",
        message: "Revisa los campos obligatorios antes de guardar.",
      });
      return;
    }

    const receiptId = nextReceipt.id || crypto.randomUUID();
    const readyReceipt = { ...nextReceipt, id: receiptId };

    setSavedReceipts((current) => {
      const index = current.findIndex((item) => item.id === receiptId);
      if (index >= 0) {
        const updated = [...current];
        updated[index] = readyReceipt;
        return updated;
      }
      return [readyReceipt, ...current];
    });

    setReceipt(cloneReceipt(readyReceipt));
    setFeedback({
      type: "success",
      message: `Recibo ${readyReceipt.receiptNumber || "sin numero"} guardado correctamente.`,
    });
  }

  function handleLoadReceipt(index: number) {
    setErrors({});
    setFeedback(null);
    const selectedReceipt = savedReceipts[index];
    setReceipt(cloneReceipt(selectedReceipt));
  }

  function handleDeleteReceipt(index: number) {
    if (!confirm("¿Borrar este recibo de expensas guardado?")) return;
    setSavedReceipts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleDeleteAllReceipts() {
    if (!confirm("¿Borrar todos los recibos de expensas guardados?")) return;
    setSavedReceipts([]);
    localStorage.removeItem("recibos_llamas_consorcio_receipts");
  }

  async function handlePrintReceipt() {
    console.log("[PDF] click en boton Imprimir");
    const normalizedReceipt = cloneReceipt({
      ...receipt,
      concepts: syncLegacyConcepts(receipt.accountStatement.monthlyConcepts),
      totalAmount: parseAccountStatementAmount(receipt.accountStatement.totalToPay),
    });
    const nextErrors = validateReceipt(normalizedReceipt);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        type: "error",
        message: "No se puede imprimir hasta completar los datos obligatorios.",
      });
      return;
    }

    try {
      console.log("[PDF] invocando generador compacto desde consortiumReceiptGenerator");
      const result = await generateConsortiumReceiptPdf({
        administration,
        consortium: selectedConsortium,
        unit: selectedUnit,
        owner: selectedOwner,
        receipt: normalizedReceipt,
      });
      console.log("[PDF] resultado generador compacto", result);
      setFeedback({
        type: result.pageCount === 1 ? "success" : "error",
        message:
          result.pageCount === 1
            ? "PDF compacto generado en 1 pagina."
            : `El PDF compacto genero ${result.pageCount} paginas.`,
      });
    } catch {
      console.error("[PDF] fallo la generacion del PDF compacto");
      setFeedback({
        type: "error",
        message: "No se pudo generar el PDF del recibo.",
      });
    }
  }

  async function handleExcelImport(file: File) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const parsed = parseWorkbookRows(rows, administration);
    if (!parsed) return;

    setAdministration(parsed.administration);
    setConsortiums((current) => mergeUnique(current, parsed.consortiums));
    setUnits((current) => mergeUnique(current, parsed.units));
    setOwners((current) => mergeUnique(current, parsed.owners));
    setSavedReceipts((current) => [...parsed.receipts, ...current]);
    setReceipt(cloneReceipt(parsed.receipts[0] ?? createReceiptFromDraft()));
    setErrors({});
  }

  const consortiumOptions = consortiums.map((item) => ({
    value: item.id,
    label: item.nombre || item.direccion || item.id,
  }));

  const unitOptions = filteredUnits.map((item) => ({
    value: item.id,
    label: `UF ${item.numeroUF || "-"} ${item.piso ? `| Piso ${item.piso}` : ""} ${item.departamento ? `| ${item.departamento}` : ""}`,
  }));

  const ownerOptions = owners.map((item) => ({
    value: item.id,
    label: item.nombre || item.cuitDni || item.id,
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white p-4">
        <h1 className="text-2xl font-semibold print:hidden">Recibos de Consorcio</h1>
        <div className="flex items-center gap-2 print:hidden">
          <button
            className="rounded-xl bg-gray-100 px-3 py-2 hover:bg-gray-200"
            onClick={handleNewReceipt}
          >
            Nuevo
          </button>
          <button
            className="rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            onClick={handleSaveReceipt}
          >
            Guardar
          </button>
          <button
            className="rounded-xl bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
            onClick={() => void handlePrintReceipt()}
          >
            Descargar PDF compacto
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-6 p-4 2xl:grid-cols-[430px_minmax(0,860px)] 2xl:items-start 2xl:justify-center">
        <section className="print:hidden">
          {feedback ? (
            <div
              className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : feedback.type === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <div className="rounded-2xl bg-white p-4 shadow">
            <SectionTitle
              title="Configuracion administracion"
              subtitle="Carga el Excel para traer automaticamente consorcio, UF, propietario y recibos."
            />

            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <label className="inline-flex cursor-pointer items-center gap-3">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleExcelImport(file);
                  }}
                />
                <span className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 mx-auto">
                  Importar Excel
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Text
                label="Nombre administracion"
                value={administration.razonSocial}
                onChange={(value) => updateAdministration("razonSocial", value)}
              />
              <Text
                label="CUIT"
                value={administration.cuit}
                onChange={(value) => updateAdministration("cuit", value)}
              />
              <Text
                label="RPA"
                value={administration.rpa}
                onChange={(value) => updateAdministration("rpa", value)}
              />
              <Text
                label="Direccion"
                value={administration.direccion}
                onChange={(value) => updateAdministration("direccion", value)}
              />
              <Text
                label="Telefono"
                value={administration.telefono}
                onChange={(value) => updateAdministration("telefono", value)}
              />
              <Text
                label="Email"
                value={administration.email}
                onChange={(value) => updateAdministration("email", value)}
              />
              <Text
                label="Sitio web"
                value={administration.website}
                onChange={(value) => updateAdministration("website", value)}
              />
              <Text
                label="Aclaracion firma"
                value={administration.firmaAclaracion}
                onChange={(value) => updateAdministration("firmaAclaracion", value)}
              />
              <FileField
                label="Logo"
                onFileChange={(file) => handleImageUpload(file, "logo")}
              />
              <FileField
                label="Firma"
                onFileChange={(file) => handleImageUpload(file, "firmaUrl")}
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Flujo sugerido
                </h2>
                <p className="text-sm text-slate-500">
                  1. Importar Excel  2. Elegir consorcio, UF y propietario  3. Ajustar conceptos  4. Guardar e imprimir
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Total a pagar cargado
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {totalToPayDisplay}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow">
            <SectionTitle title="Datos consorcio" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Consorcio"
                value={receipt.consortiumId}
                onChange={(value) =>
                  setReceipt((current) => ({
                    ...current,
                    consortiumId: value,
                    unitId: "",
                  }))
                }
                options={consortiumOptions}
                placeholder="Selecciona un consorcio"
              />
              <div className="flex items-end">
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
                  onClick={handleAddConsortium}
                >
                  Nuevo consorcio
                </button>
              </div>
              <Text
                label="Nombre"
                value={selectedConsortium?.nombre ?? ""}
                onChange={(value) => updateSelectedConsortium("nombre", value)}
              />
              <Text
                label="Direccion"
                value={selectedConsortium?.direccion ?? ""}
                onChange={(value) => updateSelectedConsortium("direccion", value)}
              />
              <Text
                label="Localidad"
                value={selectedConsortium?.localidad ?? ""}
                onChange={(value) => updateSelectedConsortium("localidad", value)}
              />
              <Text
                label="CUIT del consorcio"
                value={selectedConsortium?.cuit ?? ""}
                onChange={(value) => updateSelectedConsortium("cuit", value)}
              />
              <Text
                label="URL documentacion / Drive"
                value={selectedConsortium?.documentUrl ?? ""}
                onChange={(value) => updateSelectedConsortium("documentUrl", value)}
              />
              <Text
                label="Numero de recibo"
                value={receipt.receiptNumber}
                onChange={(value) => updateReceipt("receiptNumber", value)}
              />
              <Text
                label="Fecha"
                value={receipt.date}
                onChange={(value) => updateReceipt("date", value)}
              />
              <Text
                label="Periodo"
                value={receipt.period}
                onChange={(value) => updateReceipt("period", value)}
              />
            </div>
            <FieldError message={errors.consortium} />
            <FieldError message={errors.date} />
            <FieldError message={errors.period} />
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow">
            <SectionTitle title="Datos unidad funcional" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Unidad funcional"
                value={receipt.unitId}
                onChange={(value) => updateReceipt("unitId", value)}
                options={unitOptions}
                placeholder="Selecciona una UF"
              />
              <div className="flex items-end">
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
                  onClick={handleAddUnit}
                >
                  Nueva UF
                </button>
              </div>
              <Text
                label="Numero UF"
                value={selectedUnit?.numeroUF ?? ""}
                onChange={(value) => updateSelectedUnit("numeroUF", value)}
              />
              <Text
                label="Piso"
                value={selectedUnit?.piso ?? ""}
                onChange={(value) => updateSelectedUnit("piso", value)}
              />
              <Text
                label="Departamento"
                value={selectedUnit?.departamento ?? ""}
                onChange={(value) => updateSelectedUnit("departamento", value)}
              />
              <NumberInput
                label="% expensas"
                value={selectedUnit?.porcentajeExpensas ?? ""}
                onChange={(value) => updateSelectedUnit("porcentajeExpensas", value)}
              />
            </div>
            <FieldError message={errors.unit} />
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow">
            <SectionTitle title="Datos propietario" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Propietario"
                value={receipt.ownerId}
                onChange={(value) => updateReceipt("ownerId", value)}
                options={ownerOptions}
                placeholder="Selecciona un propietario"
              />
              <div className="flex items-end">
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
                  onClick={handleAddOwner}
                >
                  Nuevo propietario
                </button>
              </div>
              <Text
                label="Nombre"
                value={selectedOwner?.nombre ?? ""}
                onChange={(value) => updateSelectedOwner("nombre", value)}
              />
              <Text
                label="CUIT / DNI"
                value={selectedOwner?.cuitDni ?? ""}
                onChange={(value) => updateSelectedOwner("cuitDni", value)}
              />
              <Text
                label="Telefono"
                value={selectedOwner?.telefono ?? ""}
                onChange={(value) => updateSelectedOwner("telefono", value)}
              />
              <Text
                label="Email"
                value={selectedOwner?.email ?? ""}
                onChange={(value) => updateSelectedOwner("email", value)}
              />
            </div>
            <FieldError message={errors.owner} />
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow">
            <SectionTitle title="Estado de cuenta" />
            <div className="space-y-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
                      Conceptos del mes
                    </h3>
                    <p className="text-sm text-slate-500">
                      Estos importes son manuales o importados desde Excel. No se recalculan.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                    onClick={handleAddConcept}
                  >
                    Agregar concepto
                  </button>
                </div>

                <div className="mb-3 grid grid-cols-[1fr_160px] gap-3 border-b border-slate-200 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Descripcion</span>
                  <span className="text-right">Importe</span>
                </div>

                <div className="space-y-3">
                  {receipt.accountStatement.monthlyConcepts.map((concept, index) => (
                    <div key={concept.id} className="rounded-xl border p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          Concepto {index + 1}
                        </span>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
                          onClick={() => handleRemoveConcept(concept.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Text
                          label="Descripcion"
                          value={concept.description}
                          onChange={(value) => updateMonthlyConcept(concept.id, "description", value)}
                        />
                        <Text
                          label="Importe"
                          value={concept.amount}
                          onChange={(value) => updateMonthlyConcept(concept.id, "amount", value)}
                        />
                      </div>
                      <FieldError
                        message={errors.monthlyConceptRows?.[concept.id]?.description}
                      />
                      <FieldError message={errors.monthlyConceptRows?.[concept.id]?.amount} />
                    </div>
                  ))}
                </div>
                <FieldError message={errors.concepts} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Text
                  label="Deuda"
                  value={receipt.accountStatement.historicDebt}
                  onChange={(value) => updateAccountStatement("historicDebt", value)}
                />
                <Text
                  label="Intereses"
                  value={receipt.accountStatement.interest}
                  onChange={(value) => updateAccountStatement("interest", value)}
                />
                <Text
                  label="Total a pagar"
                  value={receipt.accountStatement.totalToPay}
                  onChange={(value) => updateAccountStatement("totalToPay", value)}
                />
                <Text
                  label="Pago realizado"
                  value={receipt.accountStatement.paymentMade}
                  onChange={(value) => updateAccountStatement("paymentMade", value)}
                />
                <Text
                  label="Diferencia"
                  value={receipt.accountStatement.difference}
                  onChange={(value) => updateAccountStatement("difference", value)}
                />
                <SelectField
                  label="Posee deuda"
                  value={receipt.poseeDeuda ? "si" : "no"}
                  onChange={(value) => updateReceipt("poseeDeuda", value === "si")}
                  options={[
                    { value: "no", label: "No" },
                    { value: "si", label: "Si" },
                  ]}
                  placeholder="Selecciona una opcion"
                />
              </div>
              <FieldError message={errors.totalAmount} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Forma de pago"
                  value={receipt.paymentMethod}
                  onChange={(value) => updateReceipt("paymentMethod", value as PaymentMethod)}
                  options={[
                    { value: "Efectivo", label: "Efectivo" },
                    { value: "Transferencia", label: "Transferencia" },
                    { value: "Mercado Pago", label: "Mercado Pago" },
                    { value: "Cheque", label: "Cheque" },
                    { value: "Otro", label: "Otro" },
                  ]}
                  placeholder="Selecciona forma de pago"
                />
                <TextArea
                  label="Lugar y forma de pago"
                  value={receipt.paymentDetails}
                  onChange={(value) => updateReceipt("paymentDetails", value)}
                />
              </div>
              <p className="text-xs text-slate-500">
                Los campos del Estado de Cuenta se muestran exactamente como los cargues o importes.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 shadow">
            <SectionTitle title="Recibos importados / guardados" />
            {savedReceipts.length === 0 ? (
              <p className="text-sm text-gray-500">
                Importa un Excel o guarda un recibo para verlo en esta lista.
              </p>
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleDeleteAllReceipts}
                    className="rounded-xl bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                  >
                    Borrar todos
                  </button>
                </div>
                <ul className="divide-y">
                  {savedReceipts.map((item, index) => {
                    const itemConsortium = consortiums.find(
                      (consortium) => consortium.id === item.consortiumId,
                    );
                    const itemOwner = owners.find((owner) => owner.id === item.ownerId);
                    return (
                      <li
                        key={item.id || `${item.receiptNumber}-${index}`}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <p className="font-medium">
                            Recibo {item.receiptNumber || "S/N"} -{" "}
                            {itemConsortium?.direccion || itemConsortium?.nombre || "(sin consorcio)"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.period || "(sin periodo)"} - {itemOwner?.nombre || "(sin propietario)"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-gray-100 px-3 py-1 hover:bg-gray-200"
                            onClick={() => handleLoadReceipt(index)}
                          >
                            Cargar
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100"
                            onClick={() => handleDeleteReceipt(index)}
                          >
                            Borrar
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </section>

        <section className="2xl:sticky 2xl:top-4 2xl:self-start">
          <ConsortiumReceiptPreview
            administration={administration}
            consortium={selectedConsortium}
            unit={selectedUnit}
            owner={selectedOwner}
            receipt={previewReceipt}
          />
        </section>
      </main>

    </div>
  );
}
