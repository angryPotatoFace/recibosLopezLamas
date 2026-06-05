# Consorcio Receipts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `Recibos de Consorcio` tab with isolated form state, validations, printable preview, and local persistence without breaking the existing inmobiliaria receipt flow.

**Architecture:** Keep the current inmobiliaria module intact and add a parallel consorcio module. Share only safe helpers and base inputs, store consorcio data under separate `localStorage` keys, and render a dedicated printable template for the new receipt type.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind utility classes, Vitest, React Testing Library

---

### Task 1: Add test tooling for safe refactoring

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.app.json`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders inmobiliaria tab by default", () => {
  render(<App />);

  expect(screen.getByRole("button", { name: /recibos inmobiliaria/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /generador de recibos/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL because Vitest and Testing Library are not configured yet.

- [ ] **Step 3: Write minimal implementation**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.8"
  }
}
```

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
});
```

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS with one test green.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.app.json src/test/setup.ts src/App.test.tsx
git commit -m "test: add frontend test setup"
```

### Task 2: Introduce consorcio data models and defaults

**Files:**
- Modify: `src/interfaz/index.tsx`
- Modify: `src/data.tsx`
- Create: `src/consortiumStorage.ts`
- Test: `src/consortiumStorage.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import {
  CONSORTIUM_INIT_DATA,
  CONSORTIUM_ISSUER_INIT_CONFIG,
} from "./data";

test("provides isolated consortium defaults", () => {
  expect(CONSORTIUM_INIT_DATA.clientName).toBe("");
  expect(CONSORTIUM_INIT_DATA.concepts).toHaveLength(1);
  expect(CONSORTIUM_ISSUER_INIT_CONFIG.type).toBe("CONSORCIO");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumStorage.test.ts`
Expected: FAIL because consorcio defaults and types do not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export type ReceiptType = "INMOBILIARIA" | "CONSORCIO";

export interface ConsortiumReceiptConcept {
  id: string;
  description: string;
  amount: number | "";
}

export interface ReceiptIssuerConfig {
  id: string;
  type: ReceiptType;
  name: string;
  cuit: string;
  grossIncome: string;
  activityStart: string;
  address: string;
  codeLabel: string;
  logoUrl: string;
  defaultSignatureUrl: string;
}

export interface ConsortiumReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  issuerName: string;
  issuerCuit: string;
  issuerGrossIncome: string;
  issuerActivityStart: string;
  issuerAddress: string;
  issuerCodeLabel: string;
  issuerLogoUrl: string;
  clientName: string;
  clientAddress: string;
  clientLocation: string;
  clientTaxId: string;
  clientVatCondition: string;
  totalAmount: number;
  amountInWords: string;
  signatureUrl: string;
  notes: string;
  status: "draft";
  concepts: ConsortiumReceiptConcept[];
}
```

```ts
export const CONSORTIUM_ISSUER_INIT_CONFIG: ReceiptIssuerConfig = {
  id: "consorcio-default",
  type: "CONSORCIO",
  name: "PIVA Administracion y Servicios",
  cuit: "",
  grossIncome: "",
  activityStart: "",
  address: "",
  codeLabel: "de - Cod:",
  logoUrl: "",
  defaultSignatureUrl: "",
};

export const CONSORTIUM_INIT_DATA: ConsortiumReceipt = {
  id: "",
  receiptNumber: "",
  date: "",
  issuerName: CONSORTIUM_ISSUER_INIT_CONFIG.name,
  issuerCuit: "",
  issuerGrossIncome: "",
  issuerActivityStart: "",
  issuerAddress: "",
  issuerCodeLabel: CONSORTIUM_ISSUER_INIT_CONFIG.codeLabel,
  issuerLogoUrl: "",
  clientName: "",
  clientAddress: "",
  clientLocation: "",
  clientTaxId: "",
  clientVatCondition: "",
  totalAmount: 0,
  amountInWords: "",
  signatureUrl: "",
  notes: "",
  status: "draft",
  concepts: [{ id: "concept-1", description: "", amount: "" }],
};
```

```ts
export const CONSORTIUM_STORAGE_KEYS = {
  receipts: "recibos_llamas_consorcio",
  issuerConfig: "recibos_llamas_consorcio_config",
} as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumStorage.test.ts`
Expected: PASS with defaults available and isolated from inmobiliaria.

- [ ] **Step 5: Commit**

```bash
git add src/interfaz/index.tsx src/data.tsx src/consortiumStorage.ts src/consortiumStorage.test.ts
git commit -m "feat: add consorcio data models"
```

### Task 3: Build validation and total calculation helpers

**Files:**
- Create: `src/consortiumReceiptUtils.ts`
- Test: `src/consortiumReceiptUtils.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import {
  calculateConsortiumTotal,
  validateConsortiumReceipt,
} from "./consortiumReceiptUtils";
import { CONSORTIUM_INIT_DATA } from "./data";

test("sums valid concepts and validates required fields", () => {
  const receipt = {
    ...CONSORTIUM_INIT_DATA,
    issuerName: "PIVA",
    clientName: "Juan Perez",
    date: "05-06-2026",
    concepts: [
      { id: "1", description: "Expensas abril 2026", amount: 120000 },
      { id: "2", description: "Fondo de reserva", amount: 10000 },
    ],
  };

  expect(calculateConsortiumTotal(receipt.concepts)).toBe(130000);
  expect(validateConsortiumReceipt(receipt)).toEqual({});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumReceiptUtils.test.ts`
Expected: FAIL because utility functions do not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { ConsortiumReceipt, ConsortiumReceiptConcept } from "./interfaz";

export interface ConsortiumReceiptErrors {
  issuerName?: string;
  clientName?: string;
  date?: string;
  concepts?: string;
  totalAmount?: string;
  conceptRows?: Record<string, { description?: string; amount?: string }>;
}

export function calculateConsortiumTotal(concepts: ConsortiumReceiptConcept[]): number {
  return concepts.reduce((total, concept) => {
    const amount = Number(concept.amount || 0);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}

export function validateConsortiumReceipt(
  receipt: ConsortiumReceipt,
): ConsortiumReceiptErrors {
  const errors: ConsortiumReceiptErrors = {};
  const conceptRows: ConsortiumReceiptErrors["conceptRows"] = {};

  if (!receipt.issuerName.trim()) errors.issuerName = "La razon social es obligatoria.";
  if (!receipt.clientName.trim()) errors.clientName = "El cliente es obligatorio.";
  if (!receipt.date.trim()) errors.date = "La fecha es obligatoria.";
  if (!receipt.concepts.length) errors.concepts = "Debe cargar al menos un concepto.";

  receipt.concepts.forEach((concept) => {
    const rowErrors: { description?: string; amount?: string } = {};
    if (!concept.description.trim()) rowErrors.description = "Ingrese una descripcion.";
    if (!(Number(concept.amount) > 0)) rowErrors.amount = "Ingrese un importe mayor a cero.";
    if (rowErrors.description || rowErrors.amount) {
      conceptRows[concept.id] = rowErrors;
    }
  });

  const totalAmount = calculateConsortiumTotal(receipt.concepts);
  if (Object.keys(conceptRows).length) errors.conceptRows = conceptRows;
  if (!(totalAmount > 0)) errors.totalAmount = "El total debe ser mayor a cero.";

  return errors;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumReceiptUtils.test.ts`
Expected: PASS with correct totals and empty errors for valid data.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumReceiptUtils.ts src/consortiumReceiptUtils.test.ts
git commit -m "feat: add consorcio validation utilities"
```

### Task 4: Add app-level tab navigation without breaking inmobiliaria

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Create: `src/consortiumReceiptGenerator.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("switches between inmobiliaria and consorcio tabs", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /recibos de consorcio/i }));

  expect(screen.getByRole("heading", { name: /recibos de consorcio/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /recibos inmobiliaria/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the app still renders only the inmobiliaria generator.

- [ ] **Step 3: Write minimal implementation**

```tsx
import { useState } from "react";
import "./App.css";
import ReceiptGenerator from "./generadorRecibo";
import ConsortiumReceiptGenerator from "./consortiumReceiptGenerator";
import "./index.css";

type ReceiptTab = "inmobiliaria" | "consorcio";

export default function App() {
  const [activeTab, setActiveTab] = useState<ReceiptTab>("inmobiliaria");

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex gap-2 print:hidden">
          <button onClick={() => setActiveTab("inmobiliaria")}>Recibos Inmobiliaria</button>
          <button onClick={() => setActiveTab("consorcio")}>Recibos de Consorcio</button>
        </div>

        {activeTab === "inmobiliaria" ? <ReceiptGenerator /> : <ConsortiumReceiptGenerator />}
      </div>
    </div>
  );
}
```

```tsx
export default function ConsortiumReceiptGenerator() {
  return <h1>Recibos de Consorcio</h1>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS with tab switching covered.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/consortiumReceiptGenerator.tsx
git commit -m "feat: add receipt type tabs"
```

### Task 5: Implement reusable consorcio storage helpers

**Files:**
- Modify: `src/consortiumStorage.ts`
- Test: `src/consortiumStorage.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import {
  CONSORTIUM_STORAGE_KEYS,
  loadConsortiumIssuerConfig,
  loadConsortiumReceipts,
  saveConsortiumIssuerConfig,
  saveConsortiumReceipts,
} from "./consortiumStorage";
import {
  CONSORTIUM_INIT_DATA,
  CONSORTIUM_ISSUER_INIT_CONFIG,
} from "./data";

test("loads and saves consorcio data under isolated keys", () => {
  localStorage.clear();

  saveConsortiumIssuerConfig(CONSORTIUM_ISSUER_INIT_CONFIG);
  saveConsortiumReceipts([CONSORTIUM_INIT_DATA]);

  expect(loadConsortiumIssuerConfig().type).toBe("CONSORCIO");
  expect(loadConsortiumReceipts()).toHaveLength(1);
  expect(localStorage.getItem(CONSORTIUM_STORAGE_KEYS.receipts)).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumStorage.test.ts`
Expected: FAIL because load/save helpers are still missing.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { ConsortiumReceipt, ReceiptIssuerConfig } from "./interfaz";
import {
  CONSORTIUM_INIT_DATA,
  CONSORTIUM_ISSUER_INIT_CONFIG,
} from "./data";

export const CONSORTIUM_STORAGE_KEYS = {
  receipts: "recibos_llamas_consorcio",
  issuerConfig: "recibos_llamas_consorcio_config",
} as const;

export function loadConsortiumIssuerConfig(): ReceiptIssuerConfig {
  const raw = localStorage.getItem(CONSORTIUM_STORAGE_KEYS.issuerConfig);
  return raw ? JSON.parse(raw) : CONSORTIUM_ISSUER_INIT_CONFIG;
}

export function saveConsortiumIssuerConfig(config: ReceiptIssuerConfig) {
  localStorage.setItem(CONSORTIUM_STORAGE_KEYS.issuerConfig, JSON.stringify(config));
}

export function loadConsortiumReceipts(): ConsortiumReceipt[] {
  const raw = localStorage.getItem(CONSORTIUM_STORAGE_KEYS.receipts);
  return raw ? JSON.parse(raw) : [];
}

export function saveConsortiumReceipts(receipts: ConsortiumReceipt[]) {
  localStorage.setItem(CONSORTIUM_STORAGE_KEYS.receipts, JSON.stringify(receipts));
}

export function createConsortiumReceiptDraft(): ConsortiumReceipt {
  return structuredClone(CONSORTIUM_INIT_DATA);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumStorage.test.ts`
Expected: PASS with separate keys and round-trip persistence.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumStorage.ts src/consortiumStorage.test.ts
git commit -m "feat: add consorcio local storage helpers"
```

### Task 6: Build the consorcio form with issuer, client, and concepts sections

**Files:**
- Modify: `src/consortiumReceiptGenerator.tsx`
- Modify: `src/helpers/index.tsx`
- Test: `src/consortiumReceiptGenerator.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import ConsortiumReceiptGenerator from "./consortiumReceiptGenerator";

test("renders issuer, client, and concepts sections", () => {
  render(<ConsortiumReceiptGenerator />);

  expect(screen.getByRole("heading", { name: /recibos de consorcio/i })).toBeInTheDocument();
  expect(screen.getByText(/datos de la administracion/i)).toBeInTheDocument();
  expect(screen.getByText(/datos del cliente/i)).toBeInTheDocument();
  expect(screen.getByText(/otros conceptos/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: FAIL because the component is still a placeholder.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [issuerConfig, setIssuerConfig] = useState(loadConsortiumIssuerConfig());
const [data, setData] = useState(() => ({
  ...createConsortiumReceiptDraft(),
  issuerName: issuerConfig.name,
  issuerCuit: issuerConfig.cuit,
  issuerGrossIncome: issuerConfig.grossIncome,
  issuerActivityStart: issuerConfig.activityStart,
  issuerAddress: issuerConfig.address,
  issuerCodeLabel: issuerConfig.codeLabel,
  issuerLogoUrl: issuerConfig.logoUrl,
  signatureUrl: issuerConfig.defaultSignatureUrl,
}));

return (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    <header className="sticky top-0 z-20 bg-white border-b p-4">
      <h1 className="text-2xl font-semibold">Recibos de Consorcio</h1>
    </header>
    <main className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2">
      <section className="print:hidden">
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold">Datos de la administracion</h2>
        </div>
        <div className="mt-4 bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold">Datos del cliente</h2>
        </div>
        <div className="mt-4 bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold">Otros conceptos</h2>
        </div>
      </section>
      <section>{/* preview */}</section>
    </main>
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: PASS with the three main sections visible.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumReceiptGenerator.tsx src/helpers/index.tsx src/consortiumReceiptGenerator.test.tsx
git commit -m "feat: scaffold consorcio receipt form"
```

### Task 7: Add dynamic concept rows and live totals

**Files:**
- Modify: `src/consortiumReceiptGenerator.tsx`
- Modify: `src/consortiumReceiptUtils.ts`
- Test: `src/consortiumReceiptGenerator.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import ConsortiumReceiptGenerator from "./consortiumReceiptGenerator";

test("adds concepts, removes concepts, and recalculates total", async () => {
  const user = userEvent.setup();
  render(<ConsortiumReceiptGenerator />);

  await user.type(screen.getByLabelText(/cliente/i), "Juan Perez");
  await user.type(screen.getByLabelText(/razon social/i), "PIVA");
  await user.type(screen.getByLabelText(/fecha/i), "05-06-2026");

  const rows = screen.getAllByTestId("concept-row");
  await user.type(within(rows[0]).getByLabelText(/descripcion/i), "Expensas");
  await user.type(within(rows[0]).getByLabelText(/importe/i), "100");

  await user.click(screen.getByRole("button", { name: /agregar concepto/i }));

  const nextRows = screen.getAllByTestId("concept-row");
  await user.type(within(nextRows[1]).getByLabelText(/descripcion/i), "Fondo");
  await user.type(within(nextRows[1]).getByLabelText(/importe/i), "25");

  expect(screen.getByText(/total del recibo/i)).toHaveTextContent("$ 125,00");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: FAIL because dynamic rows and total rendering are missing.

- [ ] **Step 3: Write minimal implementation**

```tsx
function handleConceptChange(id: string, field: "description" | "amount", value: string) {
  setData((current) => ({
    ...current,
    concepts: current.concepts.map((concept) =>
      concept.id === id
        ? {
            ...concept,
            [field]: field === "amount" ? (value === "" ? "" : Number(value)) : value,
          }
        : concept,
    ),
  }));
}

function addConcept() {
  setData((current) => ({
    ...current,
    concepts: [
      ...current.concepts,
      { id: crypto.randomUUID(), description: "", amount: "" },
    ],
  }));
}

function removeConcept(id: string) {
  setData((current) => ({
    ...current,
    concepts: current.concepts.filter((concept) => concept.id !== id),
  }));
}

const totalAmount = useMemo(() => calculateConsortiumTotal(data.concepts), [data.concepts]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: PASS with live totals and concept row controls.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumReceiptGenerator.tsx src/consortiumReceiptUtils.ts src/consortiumReceiptGenerator.test.tsx
git commit -m "feat: add dynamic consorcio concepts"
```

### Task 8: Add field validation and save/print guards

**Files:**
- Modify: `src/consortiumReceiptGenerator.tsx`
- Modify: `src/consortiumReceiptGenerator.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import ConsortiumReceiptGenerator from "./consortiumReceiptGenerator";

test("blocks save when required fields are missing", async () => {
  const user = userEvent.setup();
  render(<ConsortiumReceiptGenerator />);

  await user.click(screen.getByRole("button", { name: /guardar/i }));

  expect(screen.getByText(/la razon social es obligatoria/i)).toBeInTheDocument();
  expect(screen.getByText(/el cliente es obligatorio/i)).toBeInTheDocument();
  expect(screen.getByText(/debe cargar al menos un concepto/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: FAIL because the form still does not validate before saving.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [errors, setErrors] = useState<ConsortiumReceiptErrors>({});

function handleSave() {
  const nextData = { ...data, totalAmount };
  const nextErrors = validateConsortiumReceipt(nextData);
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) return;

  const receiptToSave = {
    ...nextData,
    id: nextData.id || crypto.randomUUID(),
    totalAmount,
  };

  setSavedList((current) => [receiptToSave, ...current]);
}

function handlePrint() {
  const nextErrors = validateConsortiumReceipt({ ...data, totalAmount });
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) return;
  window.print();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: PASS with visible validation messages and blocked save.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumReceiptGenerator.tsx src/consortiumReceiptGenerator.test.tsx
git commit -m "feat: validate consorcio receipts before save"
```

### Task 9: Add logo and signature upload support

**Files:**
- Modify: `src/consortiumReceiptGenerator.tsx`
- Create: `src/fileImageUtils.ts`
- Test: `src/fileImageUtils.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { fileToDataUrl } from "./fileImageUtils";

test("converts image files to data urls", async () => {
  const file = new File(["abc"], "logo.png", { type: "image/png" });
  const result = await fileToDataUrl(file);

  expect(result.startsWith("data:image/png;base64,")).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/fileImageUtils.test.ts`
Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}
```

```tsx
async function handleLogoUpload(file: File) {
  const logoUrl = await fileToDataUrl(file);
  setIssuerConfig((current) => ({ ...current, logoUrl }));
  setData((current) => ({ ...current, issuerLogoUrl: logoUrl }));
}

async function handleSignatureUpload(file: File) {
  const signatureUrl = await fileToDataUrl(file);
  setData((current) => ({ ...current, signatureUrl }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/fileImageUtils.test.ts`
Expected: PASS with image conversion covered.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumReceiptGenerator.tsx src/fileImageUtils.ts src/fileImageUtils.test.ts
git commit -m "feat: add consorcio logo and signature uploads"
```

### Task 10: Build the printable consorcio preview template

**Files:**
- Create: `src/consortiumReceiptPreview.tsx`
- Modify: `src/consortiumReceiptGenerator.tsx`
- Test: `src/consortiumReceiptPreview.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { CONSORTIUM_INIT_DATA } from "./data";
import ConsortiumReceiptPreview from "./consortiumReceiptPreview";

test("renders original copy label and otros conceptos section", () => {
  render(
    <ConsortiumReceiptPreview
      data={{
        ...CONSORTIUM_INIT_DATA,
        issuerName: "PIVA",
        date: "05-06-2026",
        clientName: "Juan Perez",
        concepts: [{ id: "1", description: "Expensas", amount: 100 }],
        totalAmount: 100,
      }}
    />,
  );

  expect(screen.getAllByText(/otros conceptos/i)).not.toHaveLength(0);
  expect(screen.getByText(/original/i)).toBeInTheDocument();
  expect(screen.getByText(/recibi\(mos\) la suma de/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumReceiptPreview.test.tsx`
Expected: FAIL because the preview template does not exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
import { money } from "./helpers";
import type { ConsortiumReceipt } from "./interfaz";

function ConsortiumReceiptCopy({
  data,
  copyLabel,
}: {
  data: ConsortiumReceipt;
  copyLabel: string;
}) {
  return (
    <div className="border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {data.issuerLogoUrl ? <img src={data.issuerLogoUrl} alt="Logo administracion" className="h-20 w-auto" /> : null}
          <div>
            <div className="text-3xl">{data.issuerName}</div>
            <div className="text-sm text-gray-600">{data.issuerAddress}</div>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-lg font-bold">RECIBO</div>
          <div>{data.receiptNumber}</div>
          <div>{data.date}</div>
          <div>CUIT: {data.issuerCuit}</div>
          <div>Ing. Brutos: {data.issuerGrossIncome}</div>
          <div>Inicio de actividades: {data.issuerActivityStart}</div>
        </div>
      </div>

      <div className="mt-4 border rounded-md p-3">
        <div className="mb-2 text-sm font-bold uppercase">Otros conceptos</div>
        {data.concepts.map((concept) => (
          <div key={concept.id} className="flex justify-between text-sm">
            <span>{concept.description}</span>
            <span>{money(concept.amount)}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div className="w-48 text-center">
          {data.signatureUrl ? <img src={data.signatureUrl} alt="Firma" className="mx-auto h-16 object-contain" /> : <div className="h-16" />}
          <div className="border-t pt-2 text-sm">Firma y aclaracion</div>
        </div>
        <div className="text-right text-base font-semibold">Total Recibo: {money(data.totalAmount)}</div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        {copyLabel.toUpperCase()} - Recibi(mos) la suma de: {money(data.totalAmount)}
      </div>
    </div>
  );
}

export default function ConsortiumReceiptPreview({ data }: { data: ConsortiumReceipt }) {
  return (
    <div className="space-y-4">
      <ConsortiumReceiptCopy data={data} copyLabel="Original" />
      <ConsortiumReceiptCopy data={data} copyLabel="Duplicado" />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumReceiptPreview.test.tsx`
Expected: PASS with copy labels, concepts, and footer text rendered.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumReceiptPreview.tsx src/consortiumReceiptGenerator.tsx src/consortiumReceiptPreview.test.tsx
git commit -m "feat: add consorcio printable preview"
```

### Task 11: Persist consorcio drafts and saved receipts in the UI

**Files:**
- Modify: `src/consortiumReceiptGenerator.tsx`
- Modify: `src/consortiumReceiptGenerator.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import ConsortiumReceiptGenerator from "./consortiumReceiptGenerator";

test("saves a valid receipt and reloads it from the saved list", async () => {
  const user = userEvent.setup();
  render(<ConsortiumReceiptGenerator />);

  await user.type(screen.getByLabelText(/razon social/i), "PIVA");
  await user.type(screen.getByLabelText(/^cliente/i), "Juan Perez");
  await user.type(screen.getByLabelText(/fecha/i), "05-06-2026");
  await user.type(screen.getByLabelText(/descripcion/i), "Expensas");
  await user.type(screen.getByLabelText(/importe/i), "100");
  await user.click(screen.getByRole("button", { name: /guardar/i }));

  expect(screen.getByText(/juan perez/i)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /nuevo/i }));
  await user.click(screen.getByRole("button", { name: /cargar/i }));

  expect(screen.getByDisplayValue("Juan Perez")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: FAIL because save list, load action, and local persistence are incomplete.

- [ ] **Step 3: Write minimal implementation**

```tsx
useEffect(() => {
  setSavedList(loadConsortiumReceipts());
}, []);

useEffect(() => {
  saveConsortiumReceipts(savedList);
}, [savedList]);

useEffect(() => {
  saveConsortiumIssuerConfig(issuerConfig);
}, [issuerConfig]);

function handleNew() {
  setErrors({});
  setData({
    ...createConsortiumReceiptDraft(),
    issuerName: issuerConfig.name,
    issuerCuit: issuerConfig.cuit,
    issuerGrossIncome: issuerConfig.grossIncome,
    issuerActivityStart: issuerConfig.activityStart,
    issuerAddress: issuerConfig.address,
    issuerCodeLabel: issuerConfig.codeLabel,
    issuerLogoUrl: issuerConfig.logoUrl,
    signatureUrl: issuerConfig.defaultSignatureUrl,
  });
}

function loadSaved(index: number) {
  setErrors({});
  setData(savedList[index]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/consortiumReceiptGenerator.test.tsx`
Expected: PASS with save, reset, and reload behavior working.

- [ ] **Step 5: Commit**

```bash
git add src/consortiumReceiptGenerator.tsx src/consortiumReceiptGenerator.test.tsx
git commit -m "feat: persist consorcio receipts locally"
```

### Task 12: Final regression pass for inmobiliaria and build verification

**Files:**
- Modify: `src/App.test.tsx`
- Test: `src/generadorRecibo.smoke.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import ReceiptGenerator from "./generadorRecibo";

test("inmobiliaria generator still renders its main heading", () => {
  render(<ReceiptGenerator />);

  expect(screen.getByRole("heading", { name: /generador de recibos/i })).toBeInTheDocument();
  expect(screen.getByText(/importa desde excel/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/generadorRecibo.smoke.test.tsx`
Expected: FAIL if the refactor introduced rendering regressions or if test setup still needs mocks around browser APIs.

- [ ] **Step 3: Write minimal implementation**

```ts
Object.defineProperty(window, "print", {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn(() => true),
});
```

```tsx
import { render, screen } from "@testing-library/react";
import ReceiptGenerator from "./generadorRecibo";

test("inmobiliaria generator still renders its main heading", () => {
  render(<ReceiptGenerator />);

  expect(screen.getByRole("heading", { name: /generador de recibos/i })).toBeInTheDocument();
  expect(screen.getByText(/carga manualmente o importa desde excel/i)).toBeInTheDocument();
});
```

- [ ] **Step 4: Run test to verify it passes**

Run:
- `npm test`
- `npm run build`

Expected:
- all tests PASS
- build completes without TypeScript or Vite errors

- [ ] **Step 5: Commit**

```bash
git add src/test/setup.ts src/App.test.tsx src/generadorRecibo.smoke.test.tsx
git commit -m "test: add inmobiliaria regression coverage"
```
