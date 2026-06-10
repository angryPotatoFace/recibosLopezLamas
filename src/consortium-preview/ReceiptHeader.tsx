import type { ReactNode } from "react";
import type { AdministrationSettings, Consortium, ExpenseReceipt } from "../interfaz";
import { CalendarIcon, ReceiptIcon } from "./icons";

function HeaderMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 print:rounded-[12px] print:px-2 print:py-2">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </div>
        <div className="mt-1 text-sm font-semibold leading-tight text-slate-900 print:text-[13px] md:text-base">
          {value || " "}
        </div>
      </div>
    </div>
  );
}

export default function ReceiptHeader({
  administration,
  consortium,
  receipt,
}: {
  administration: AdministrationSettings;
  consortium?: Consortium;
  receipt: ExpenseReceipt;
}) {
  const consortiumTitle = consortium?.direccion
    ? `CONSORCIO ${consortium.direccion.toUpperCase()}`
    : consortium?.nombre?.toUpperCase() || "CONSORCIO";

  return (
    <header className="receipt-section rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(7,59,83,0.08)] print:break-inside-avoid print:rounded-[14px] print:px-3 print:py-3 print:shadow-none md:px-5 md:py-5">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_220px] lg:items-center print:grid-cols-[190px_1fr_180px]">
        <div className="flex items-center justify-start">
          <div className="flex h-32 w-44 shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-slate-50 print:h-22 print:w-32 print:rounded-[14px] md:h-36 md:w-48">
            {administration.logo ? (
              <img
                src={administration.logo}
                alt="Logo PIVA"
                className="max-h-[120px] max-w-[176px] object-contain print:max-h-[84px] print:max-w-[124px] md:max-h-[130px] md:max-w-[188px]"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border border-dashed border-slate-300" />
            )}
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-[34px] font-semibold uppercase leading-tight tracking-[0.04em] text-[#083d55] print:text-[28px]">
            Recibo de Expensas
          </h1>
          <p className="mt-2 text-lg font-semibold uppercase tracking-[0.12em] text-[#be8a2b] print:text-base md:text-xl">
            {consortiumTitle}
          </p>
        </div>

        <div className="grid gap-2 print:gap-2">
          <HeaderMetric
            icon={<ReceiptIcon />}
            label="Nro. recibo"
            value={receipt.receiptNumber}
          />
          <HeaderMetric
            icon={<CalendarIcon />}
            label="Fecha de pago"
            value={receipt.date}
          />
          <HeaderMetric
            icon={<CalendarIcon />}
            label="Periodo"
            value={receipt.period}
          />
        </div>
      </div>
    </header>
  );
}
