export default function FinalStatusCard({
  difference,
}: {
  difference: number;
}) {
  const clear = difference <= 0;

  return (
    <section className="final-status-card receipt-section flex h-full flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white px-5 py-6 text-center shadow-[0_10px_30px_rgba(8,35,48,0.08)] print:break-inside-avoid print:rounded-[14px] print:px-4 print:py-4 print:shadow-none md:px-6">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold print:h-16 print:w-16 print:text-xl md:h-24 md:w-24 md:text-3xl ${
          clear ? "bg-[#0d4960] text-white" : "bg-red-100 text-red-700"
        }`}
      >
        {clear ? "OK" : "!"}
      </div>
      <div className="mt-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#083d55] print:mt-3 print:text-[11px]">
        Estado Final
      </div>
      <div className="mt-4 h-px w-24 bg-[#d0b06b]" />
      <div
        className={`mt-4 whitespace-pre-line text-2xl font-semibold uppercase leading-tight print:mt-3 print:text-xl md:text-3xl ${
          clear ? "text-[#5f8f32]" : "text-red-700"
        }`}
      >
        {clear ? "Sin deuda\na la fecha" : "Posee\ndeuda"}
      </div>
      <div className="mt-5 h-px w-24 bg-[#d0b06b]" />
      <p className="mt-5 max-w-[220px] text-sm leading-7 text-slate-700 print:mt-3 print:text-xs print:leading-5 md:text-base">
        {clear
          ? "Gracias por abonar en termino."
          : "Queda saldo pendiente."}
      </p>
    </section>
  );
}
