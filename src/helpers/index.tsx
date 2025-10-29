/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReceiptData } from "../interfaz";
import Logo from "../assets/Logo-Inmobiliaria.png"

// eslint-disable-next-line react-refresh/only-export-components
export function money(n: number | ""): string {
  if (n === "" || isNaN(Number(n))) return "";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    Number(n)
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function parseBoolLike(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return ["1", "si", "sí", "true", "x", "ok"].includes(s);
  }
  return false;
}

// eslint-disable-next-line react-refresh/only-export-components
export function fromExcelHeader(h: string) {
  // normalize header names
  return h.replace(/\s+/g, "").toLowerCase();
}

export function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm">
      <span className="block text-gray-600 mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
    </label>
  );
}

export function NumberInput({ label, value, onChange }: { label: string; value: number | ""; onChange: (v: number | "") => void }) {
  return (
    <label className="text-sm">
      <span className="block text-gray-600 mb-1">{label}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm md:col-span-2">
      <span className="block text-gray-600 mb-1">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
    </label>
  );
}

// ----------------------------- Printable Preview -----------------------------

export function Row({ label, value, className = "" }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex gap-2 text-[10px] ${className}`}>
      <div className="w-32 font-semibold">{label}</div>
      <div className="flex-1 border-b border-gray-300 w-20 ml-0">{value}</div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-md p-2">
      <div className="uppercase text-[10px] font-bold tracking-wide border-b pb-1 mb-2">{title}</div>
      {children}
    </div>
  );
}

export function Receipt({ data, copyLabel, totalAlquiler, totalRecibo }: { data: ReceiptData; copyLabel: string; totalAlquiler: number; totalServicios: number; totalRecibo: number; }) {
  return (
    <div className="border rounded-xl bg-white p-4 print:shadow-none shadow-sm">
      <div className="flex items-start justify-between">
        <div >
          <div className="flex">
            <img width={60} src={Logo} />
            <div className="ml-4">
              <div className="text-sm font-normal text-gray-600 text-left">INMOBILIARIA</div>
              <div className="text-3xl align-text-top text-left">López Lamas</div>
            </div>
          </div>
          <div className="text-[8px] font-normal text-gray-600 align-middle">De Nancy A. López COL.S.M. 1684</div>
          <div className="text-[7px] font-normal text-gray-600 text-left">Vicente López 3007 (1653) Villa Ballester Pcia. de Buenos Aires | Tel: 4738-3525</div>
          <div className="text-[10px] mt-3 font-bold align-middle">Responsable Monotributo</div>
        </div>
        <div className="w-2 my-auto mr-16">
          <div className="border border-1 w-10 p-1 font-bold">
              X
          </div>
          <div className="text-[7px] leading-tight mt-1">
            <p className="mx-auto">Documento</p>
            <p className="text-nowrap">no valido</p> 
            <p className="text-nowrap">como factura</p> 
          </div>
        </div>

        <div className="align-text-bottom text-[10px]">
          <div className="font-bold text-[15px]">
             <p>RECIBO</p>
          </div>
          <div className="mt-10">
            <p>C.U.I.T: 27-17725659-0</p>
            <p>Ing. Brutos: 27-17725659-0</p>
            <p>Inicio de actividades: 01-03-91</p>
          </div>
        </div>
      </div>

      <hr className="mt-2"/>
        <div className="mt-2 text-[8px] text-center font-bold text-nowrap">
          COBRO POR CUENTA Y ORDEN DE TERCEROS, IMPORTE PARA SER ENTREGADO AL PROPIETARIO O A QUIEN CORRESPONDA
        </div>
        <div className="flex text-[8px] mt-2">
          <div className="text-left ml-5">
            <Row className="w-2 text-nowrap" label="Cliente" value={data.cliente} />
            <Row className="w-2 text-nowrap" label="Dirección" value={data.direccion} />
            <Row className="w-2 text-nowrap" label="I.V.A" value={data.iva} />
          </div>
          <div className="text-right ml-56">
            <Row className="" label="Localidad" value={data.localidad} />
            <Row label="C.U.I.T/D.N.I" value={data.cuiltDni} />
          </div>
        </div>

      <hr className="mt-2 w-full"/>
      <div className="flex mt-2 text-[10px] text-right">
        <Row className="w-16 text-nowrap" label="Contrato" value={data.contrato} />
        <Row label="Inicio" value={data.inicio} />
        <Row label="Finalización" value={data.finalizacion} />
      </div>

      <div className="mt-1 grid grid-cols-2 text-[10px]">
        <Row className="w-28 text-nowrap" label="En concepto de" value={data.enConceptoDe} />
        <Row label="Alquiler" value={
          <div className="flex items-center justify-between">
            <span>{money(totalAlquiler)}</span>
            {data.aproximado && <span className="text-[10px] font-bold text-red-500">Aproximado</span>}
          </div>
        } />
        <Row className="w-32 mt-1 text-nowrap" label="Dirección inmueble" value={data.direccionInmueble} />
        <div></div>
        <Row className="mt-1 mr-28 w-2 text-nowrap" label="Propietario" value={data.propietario} />
        <div></div>
        <Row className="mt-1 w-2 text-nowrap" label="Correspondiente al mes de" value={data.mesCorrespondiente} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Box title="Facturas de servicios a entregar en inmobiliaria">
          <div className="text-[11px] space-y-1">
            <div className="flex justify-between"><span>Edenor:</span><span>{money(Number(data.utilities.edenor || 0))}</span></div>
            <div className="flex justify-between"><span>Gas Nat.:</span><span>{money(Number(data.utilities.gas || 0))}</span></div>
            <div className="flex justify-between"><span>Agua:</span><span>{money(Number(data.utilities.agua || 0))}</span></div>
            <div className="flex justify-between"><span>Expensas:</span><span>{money(Number(data.utilities.expensas || 0))}</span></div>
            <div className="flex justify-between"><span>ABL:</span><span>{money(Number(data.utilities.abl || 0))}</span></div>
          </div>
        </Box>
        <Box title="Otros conceptos">
          <div className="text-[11px] whitespace-pre-wrap min-h-[72px]">{data.otrosConceptos}</div>
        </Box>
      </div>

      <div className="mt-15 flex items-center justify-between text-[12px] w-[90%]">
        <div className="flex-1 border-t pt-2 mr-4 text-center">Firma y aclaración</div>
        <div className="text-right font-semibold">Total Recibo: {money(totalRecibo)}</div>
      </div>

      <div className="mt-2 text-[10px] text-gray-500">"{copyLabel.toUpperCase()}" — Recibí(mos) la suma de: {money(totalRecibo)}</div>
    </div>
  );
}

export function ReceiptPreview({ data, totalAlquiler, totalServicios, totalRecibo }: { data: ReceiptData; totalAlquiler: number; totalServicios: number; totalRecibo: number; }) {
  return (
    <div className="space-y-4">
      <div className="print:break-after-page print:mb-0">
        <Receipt data={data} totalAlquiler={totalAlquiler} totalServicios={totalServicios} totalRecibo={totalRecibo} copyLabel="Original" />
      </div>
      <div className="print:mt-0">
        <Receipt data={data} totalAlquiler={totalAlquiler} totalServicios={totalServicios} totalRecibo={totalRecibo} copyLabel="Duplicado" />
      </div>
    </div>
  );
}
