import type { AdministrationSettings } from "../interfaz";

export default function SignatureSection({
  administration,
}: {
  administration: AdministrationSettings;
}) {
  return (
    <section className="signature-section receipt-section flex flex-col items-center justify-end rounded-[22px] border border-slate-200 bg-white px-5 py-4 text-center shadow-[0_10px_30px_rgba(8,35,48,0.06)] print:break-inside-avoid print:rounded-[14px] print:px-4 print:py-3 print:shadow-none">
      <div className="flex h-20 w-full items-end justify-center print:h-16 md:h-24">
        {administration.firmaUrl ? (
          <img
            src={administration.firmaUrl}
            alt="Firma PIVA"
            className="max-h-20 max-w-[220px] object-contain md:max-h-24"
          />
        ) : (
          <div className="h-16 w-44 border-b border-slate-300 md:h-20 md:w-52" />
        )}
      </div>
      <div className="mt-3 w-full border-t border-[#0d4960] pt-3 text-center">
        <div className="text-base font-semibold uppercase tracking-wide text-[#083d55] md:text-lg">
          PIVA Administracion y Servicios
        </div>
        <div className="mt-1 text-sm text-slate-600">Administracion</div>
      </div>
    </section>
  );
}
