import { ShieldIcon } from "./icons";

export default function ValidationBadge() {
  return (
    <section className="receipt-section flex items-center gap-4 rounded-[22px] border border-[#ead9b0] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(8,35,48,0.06)] print:break-inside-avoid print:rounded-[14px] print:px-4 print:py-3 print:shadow-none">
      <div className="shrink-0">
        <ShieldIcon />
      </div>
      <div>
        <div className="text-xl font-semibold uppercase text-[#083d55] print:text-lg md:text-2xl">
          Recibo valido
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Comprobante emitido por PIVA Administracion y Servicios.
        </div>
      </div>
    </section>
  );
}
