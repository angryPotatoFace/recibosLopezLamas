import type { Consortium } from "../interfaz";
import { FolderIcon } from "./icons";

function buildQrUrl(url: string) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=220`;
}

export default function QRSection({
  consortium,
}: {
  consortium?: Consortium;
}) {
  if (!consortium?.documentUrl) return null;

  return (
    <section className="receipt-section footer-section grid gap-5 rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(8,35,48,0.08)] print:break-inside-avoid print:rounded-[14px] print:px-3 print:py-3 print:shadow-none lg:grid-cols-[1.25fr_160px_0.95fr] lg:px-5 lg:py-5">
      <div className="flex gap-4">
        <div className="shrink-0">
          <FolderIcon />
        </div>
        <div>
          <div className="text-base font-semibold uppercase leading-tight text-[#083d55] print:text-sm md:text-[18px]">
            Escanee el QR para acceder a la documentacion del edificio
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 print:mt-2 print:text-xs print:leading-5 md:text-[15px]">
            En este Drive encontrara la documentacion actualizada del consorcio y el historico de pagos.
          </p>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 print:mt-3 print:text-xs md:grid-cols-2 md:text-[15px]">
            <p>- Liquidaciones y recibos</p>
            <p>- Seguros y habilitaciones</p>
            <p>- Actas de asamblea</p>
            <p>- Mantenimiento y trabajos realizados</p>
            <p>- Reglamento y normativa</p>
            <p>- Y mas</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <img
          src={buildQrUrl(consortium.documentUrl)}
          alt="QR documentacion del consorcio"
          className="h-32 w-32 object-contain print:h-28 print:w-28 md:h-36 md:w-36"
        />
      </div>

      <div className="flex flex-col justify-between text-sm text-slate-700 print:text-xs lg:border-l lg:border-slate-200 lg:pl-5 md:text-[15px]">
        <div>
          <p>Este recibo corresponde al pago registrado para la unidad indicada.</p>
          <p className="mt-3 font-semibold">
            El detalle completo de la liquidacion se encuentra en la expensa mensual enviada.
          </p>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs md:text-sm">
          <p className="font-medium text-[#083d55]">Carpeta del consorcio:</p>
          <p className="mt-1 break-all">{consortium.documentUrl}</p>
        </div>
      </div>
    </section>
  );
}
