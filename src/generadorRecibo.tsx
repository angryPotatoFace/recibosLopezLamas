/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import type { ReceiptData, UtilityKeys } from "./interfaz";
import { INIT_DATA } from "./data";
import { fromExcelHeader, money, NumberInput, parseBoolLike, TextArea, Text, ReceiptPreview } from "./helpers";


const EMPTY_DATA: ReceiptData = INIT_DATA;

export default function ReceiptGenerator() {
  const [data, setData] = useState<ReceiptData>({ ...EMPTY_DATA });
  const [savedList, setSavedList] = useState<ReceiptData[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("recibos_llamas");
    if (raw) setSavedList(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("recibos_llamas", JSON.stringify(savedList));
  }, [savedList]);

  const totalAlquiler = useMemo(() => {
    const base = Number(data.alquiler );
    const inc = Number(data.aumentoPorcentual || 0);
    const total = base * (1 + inc / 100);
    return isFinite(total) ? total : 0;
  }, [data.alquiler, data.aumentoPorcentual]);

  const totalServicios = useMemo(() => {
    const u = data.utilities;
    return (Number(u.edenor || 0) +
      Number(u.gas || 0) +
      Number(u.agua || 0) +
      Number(u.expensas || 0) +
      Number(u.abl || 0));
  }, [data.utilities]);

  const totalRecibo = useMemo(() => totalAlquiler + totalServicios, [totalAlquiler, totalServicios]);

  const handleUtilityChange = (k: UtilityKeys, v: string) =>
    setData((d) => ({ ...d, utilities: { ...d.utilities, [k]: v === "" ? "" : Number(v) } }));

  const handleExcel = async (file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    if (!rows.length) return;
    const r: any = rows[0];
    const m: Record<string, any> = {};
    Object.entries(r).forEach(([k, v]) => (m[fromExcelHeader(k)] = v));

    const next: ReceiptData = {
      cliente: m["cliente"] ?? "",
      direccion: m["direccion"] ?? "",
      iva: m["iva"] ?? "",
      cuiltDni: m["cuilt_dni"] ?? m["cuil"] ?? m["dni"] ?? "",
      localidad: m["localidad"] ?? "",
      contrato: m["contrato"] ?? "",
      inicio: m["inicio"] ?? "",
      finalizacion: m["finalizacion"] ?? "",
      enConceptoDe: m["enconceptode"] ?? "",
      direccionInmueble: m["direccioninmueble"] ?? "",
      propietario: m["propietario"] ?? "",
      mesCorrespondiente: m["mescorrespondiente"] ?? "",
      alquiler: m["alquiler"] !== "" ? Number(m["alquiler"]) : "",
      aumentoPorcentual: m["aumentoporcentual"] !== "" ? Number(m["aumentoporcentual"]) : 0,
      aproximado: parseBoolLike(m["aproximado"]),
      otrosConceptos: m["otrosconceptos"] ?? "",
      observaciones: m["observaciones"] ?? "",
      utilities: {
        edenor: m["edenor"] !== "" ? Number(m["edenor"]) : "",
        gas: m["gas"] !== "" ? Number(m["gas"]) : "",
        agua: m["agua"] !== "" ? Number(m["agua"]) : "",
        expensas: m["expensas"] !== "" ? Number(m["expensas"]) : "",
        abl: m["abl"] !== "" ? Number(m["abl"]) : "",
      },
    };
    setData(next);
  };

  const handleSave = () => {
    setSavedList((list) => [data, ...list]);
  };

  const handleNew = () => setData({ ...EMPTY_DATA });

  const loadSaved = (idx: number) => setData(savedList[idx]);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold print:hidden">Generador de Recibos – Inmobiliaria López Lamas</h1>
        <div className="flex items-center gap-2 print:hidden">
          <button className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200" onClick={handleNew}>Nuevo</button>
          <button className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave}>Guardar</button>
          <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePrint}>Imprimir</button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        {/* -------------------- Left: Form -------------------- */}
        <section className="print:hidden">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold">Datos</h2>
                <p className="text-sm text-gray-500">Cargá manualmente o importá desde Excel (.xlsx)</p>
              </div>
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleExcel(f);
                  }}
                />
                <span className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Importar Excel</span>
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Text label="Cliente" value={data.cliente} onChange={(v) => setData({ ...data, cliente: v })} />
              <Text label="Dirección" value={data.direccion} onChange={(v) => setData({ ...data, direccion: v })} />
              <Text label="I.V.A." value={data.iva} onChange={(v) => setData({ ...data, iva: v })} />
              <Text label="C.U.I.T / D.N.I" value={data.cuiltDni} onChange={(v) => setData({ ...data, cuiltDni: v })} />
              <Text label="Localidad" value={data.localidad} onChange={(v) => setData({ ...data, localidad: v })} />

              <Text label="Contrato" value={data.contrato} onChange={(v) => setData({ ...data, contrato: v })} />
              <Text label="Inicio (YYYY-MM-DD)" value={data.inicio} onChange={(v) => setData({ ...data, inicio: v })} />
              <Text label="Finalización (YYYY-MM-DD)" value={data.finalizacion} onChange={(v) => setData({ ...data, finalizacion: v })} />

              <Text label="En concepto de" value={data.enConceptoDe} onChange={(v) => setData({ ...data, enConceptoDe: v })} />
              <Text label="Dirección inmueble" value={data.direccionInmueble} onChange={(v) => setData({ ...data, direccionInmueble: v })} />
              <Text label="Propietario" value={data.propietario} onChange={(v) => setData({ ...data, propietario: v })} />
              <Text label="Correspondiente al mes de" value={data.mesCorrespondiente} onChange={(v) => setData({ ...data, mesCorrespondiente: v })} />

              <NumberInput label="Alquiler (base)" value={data.alquiler} onChange={(v) => setData({ ...data, alquiler: v })} />
              <NumberInput label="Aumento %" value={data.aumentoPorcentual} onChange={(v) => setData({ ...data, aumentoPorcentual: v })} />

              <div className="flex items-center gap-2">
                <input id="aprox" type="checkbox" checked={data.aproximado} onChange={(e) => setData({ ...data, aproximado: e.target.checked })} />
                <label htmlFor="aprox" className="text-sm">Agregar leyenda "aproximado" debajo del alquiler</label>
              </div>

              <TextArea label="Otros conceptos" value={data.otrosConceptos} onChange={(v) => setData({ ...data, otrosConceptos: v })} />
              <TextArea label="Observaciones (no se imprime)" value={data.observaciones} onChange={(v) => setData({ ...data, observaciones: v })} />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Servicios a entregar en Inmobiliaria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <NumberInput label="Edenor" value={data.utilities.edenor ?? ""} onChange={(v) => handleUtilityChange("edenor", String(v))} />
                <NumberInput label="Gas Nat." value={data.utilities.gas ?? ""} onChange={(v) => handleUtilityChange("gas", String(v))} />
                <NumberInput label="Agua" value={data.utilities.agua ?? ""} onChange={(v) => handleUtilityChange("agua", String(v))} />
                <NumberInput label="Expensas" value={data.utilities.expensas ?? ""} onChange={(v) => handleUtilityChange("expensas", String(v))} />
                <NumberInput label="ABL" value={data.utilities.abl ?? ""} onChange={(v) => handleUtilityChange("abl", String(v))} />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><span className="font-medium">Total alquiler:</span> {money(totalAlquiler)} {data.aproximado && <em className="ml-1">(aproximado)</em>}</p>
                <p><span className="font-medium">Total servicios:</span> {money(totalServicios)}</p>
                <p><span className="font-semibold">Total Recibo:</span> {money(totalRecibo)}</p>
              </div>
            </div>
          </div>

          {/* Saved months */}
          <div className="bg-white rounded-2xl shadow p-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Recibos guardados</h2>
            {savedList.length === 0 && <p className="text-sm text-gray-500">Aún no guardaste recibos.</p>}
            <ul className="divide-y">
              {savedList.map((r, i) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.mesCorrespondiente || "(sin mes)"} — {r.cliente || "(sin cliente)"}</p>
                    <p className="text-xs text-gray-500">{r.direccionInmueble}</p>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => loadSaved(i)}>Cargar</button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------- Right: Preview (Printable) -------------------- */}
        <section>
          <ReceiptPreview data={data} totalAlquiler={totalAlquiler} totalServicios={totalServicios} totalRecibo={totalRecibo} />
        </section>
      </main>

      <style>{`
        @media print {
          header, .print:hidden, .print-hidden { display: none !important; }
          main { grid-template-columns: 1fr !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}

// ----------------------------- UI Controls -----------------------------

