import { money } from "../helpers";

export default function TotalAmountBar({
  totalPaid,
}: {
  totalPaid: number;
}) {
  return (
    <section className="total-bar receipt-section rounded-[20px] bg-gradient-to-r from-[#073b53] to-[#0d4960] px-5 py-4 text-white shadow-[0_12px_28px_rgba(7,59,83,0.25)] print:break-inside-avoid print:rounded-[14px] print:px-4 print:py-3 print:shadow-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-semibold uppercase tracking-[0.16em] md:text-2xl print:text-base">
          Total abonado
        </div>
        <div className="text-3xl font-semibold md:text-[42px] print:text-[30px]">{money(totalPaid)}</div>
      </div>
    </section>
  );
}
