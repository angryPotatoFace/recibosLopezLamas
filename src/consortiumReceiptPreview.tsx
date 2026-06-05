import { money } from "./helpers";
import type {
  AdministrationSettings,
  Consortium,
  ExpenseReceipt,
  Owner,
  Unit,
} from "./interfaz";

function FilledLine({
  label,
  value,
  labelWidth = "min-w-12",
}: {
  label: string;
  value: string;
  labelWidth?: string;
}) {
  return (
    <div className="flex items-end gap-2 text-[11px]">
      <span className={`${labelWidth} font-medium text-slate-700`}>{label}</span>
      <span className="flex-1 border-b border-slate-400 px-1 pb-[1px] leading-none">
        {value || " "}
      </span>
    </div>
  );
}

function CompactAmountLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_96px] gap-2 text-[11px]">
      <span>{label}</span>
      <span className="text-right">{value || " "}</span>
    </div>
  );
}

function ReceiptFrame({
  administration,
  consortium,
  unit,
  owner,
  receipt,
  copyLabel,
}: {
  administration: AdministrationSettings;
  consortium?: Consortium;
  unit?: Unit;
  owner?: Owner;
  receipt: ExpenseReceipt;
  copyLabel: string;
}) {
  const consortiumTitle = consortium?.direccion
    ? `CONSORCIO ${consortium.direccion.toUpperCase()}`
    : "CONSORCIO";

  return (
    <div className="border-2 border-[#3c696a] bg-white p-4 text-slate-800 shadow-sm print:shadow-none">
      <div className="border-b-2 border-[#3c696a] pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex h-25 w-28 shrink-0 items-center justify-center overflow-hidden">
              {administration.logo ? (
                <img
                  src={administration.logo}
                  alt="Logo administracion"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="h-full w-full border border-dashed border-slate-300" />
              )}
            </div>
            <div className="flex-1 pt-4 text-center ml-5">
              <div className="text-[17px] font-semibold uppercase tracking-wide text-[#2d5657]">
                RECIBO DE EXPENSAS
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#2d5657]">
                {consortiumTitle}
              </div>
            </div>
          </div>

          <div className="w-32 shrink-0 text-right text-[11px] pt-4">
            <p className="font-semibold uppercase text-[#2d5657]">{copyLabel}</p>
            <p className="mt-1">N° {receipt.receiptNumber || " "}</p>
            <p>{receipt.date || " "}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-[#3c696a] py-3 text-[11px]">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#2d5657]">
          Datos del Consorcio
        </div>
        <div className="space-y-2 text-left">
          <FilledLine label="Nombre:" value={administration.razonSocial || ""} />
          <FilledLine label="Direccion:" value={administration.direccion || ""} />
          <div className="grid grid-cols-2 gap-4">
            <FilledLine label="Telefono:" value={administration.telefono || ""} />
            <FilledLine label="Email:" value={administration.email || ""} labelWidth="min-w-5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FilledLine label="CUIT:" value={administration.cuit || ""}/>
            <FilledLine label="RPA:" value={administration.rpa || ""} labelWidth="min-w-8" />
          </div>
        </div>
      </div>

      <div className="border-b border-[#3c696a] py-3 text-[11px]">
        <div className="space-y-2 text-left">
          <FilledLine label="Nombre inquilino:" value={owner?.nombre || ""} />
          <FilledLine label="CUIT / DNI:" value={owner?.cuitDni || ""}  labelWidth="min-w-22" />
          <FilledLine
            label="Direccion:"
            value={
              consortium?.direccion
                ? `${consortium.direccion}${consortium.localidad ? `, ${consortium.localidad}` : ""}`
                : ""
            }
            labelWidth="min-w-22"
          />
          <div className="grid grid-cols-3 gap-4 pt-1">
            <FilledLine label="Piso:" value={unit?.piso || ""}  />
            <FilledLine
              label="Departamento:"
              value={unit?.departamento || ""}
            />
            <FilledLine
              label="Unidad Funcional:"
              value={unit?.numeroUF || ""}
            />
          </div>
        </div>
      </div>

      <div className="border-b border-[#3c696a] py-3">
        <div className="grid grid-cols-[1fr_190px] gap-4 text-[11px]">
          <div>
            <FilledLine label="Periodo:" value={receipt.period} labelWidth="min-w-16" />
          </div>
          <div className="rounded-sm border border-[#9bb5b6] px-2 py-1">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#2d5657]">
              Estado de cuenta
            </div>
            <div className="space-y-1">
              <CompactAmountLine
                label="Saldo:"
                value={money(receipt.accountStatus.saldoAnterior)}
              />
              <CompactAmountLine
                label="Su pago:"
                value={money(receipt.accountStatus.pagoRealizado)}
              />
              <CompactAmountLine
                label="Saldo a favor:"
                value={money(receipt.accountStatus.saldoAFavor)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-[#3c696a] py-3">
        <div className="mb-2 text-[11px] font-medium text-[#2d5657] font-black">Conceptos</div>
        <div className="grid grid-cols-[1fr_120px] gap-2 border-b border-[#3c696a] pb-1 text-[11px] font-semibold uppercase text-[#2d5657]">
          <span>Concepto</span>
          <span className="text-right">Importe</span>
        </div>
        <div className="min-h-40 pt-2">
          {receipt.concepts.map((concept) => (
            <div
              key={concept.id}
              className="grid grid-cols-[1fr_120px] gap-2 py-1 text-[11px]"
            >
              <span>{concept.description || " "}</span>
              <span className="text-right">{money(concept.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-[1fr_120px] gap-2 border-t border-[#3c696a] pt-2 text-[12px] font-bold uppercase text-[#2d5657]">
          <span>TOTAL</span>
          <span className="text-right">{money(receipt.totalAmount)}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-6 py-3">
        <div className="flex-1" />

        <div className="w-[190px] self-end border border-[#3c696a] px-3 py-2 text-center text-[10px]">
          <div className="flex h-16 items-end justify-center">
            {administration.firmaUrl ? (
              <img
                src={administration.firmaUrl}
                alt="Firma autorizada"
                className="max-h-14 max-w-full object-contain"
              />
            ) : null}
          </div>
          <div className="mt-2 border-t border-[#3c696a] pt-1">
            {administration.firmaAclaracion || "Firma autorizada y aclaracion"}
          </div>
        </div>
      </div>

      <div className="border-t border-[#3c696a] pt-2 text-center text-[8.5px] text-slate-600">
        Ante cualquier consulta o diferencia, comunicarse con la Administración dentro de los 30 dias de emitido el presente comprobante.
      </div>
    </div>
  );
}

export default function ConsortiumReceiptPreview({
  administration,
  consortium,
  unit,
  owner,
  receipt,
}: {
  administration: AdministrationSettings;
  consortium?: Consortium;
  unit?: Unit;
  owner?: Owner;
  receipt: ExpenseReceipt;
}) {
  return (
    <div className="space-y-4">
      <div className="print:break-after-page print:mb-0">
        <ReceiptFrame
          administration={administration}
          consortium={consortium}
          unit={unit}
          owner={owner}
          receipt={receipt}
          copyLabel="Original"
        />
      </div>
      <div className="print:mt-0">
        <ReceiptFrame
          administration={administration}
          consortium={consortium}
          unit={unit}
          owner={owner}
          receipt={receipt}
          copyLabel="Duplicado"
        />
      </div>
    </div>
  );
}
