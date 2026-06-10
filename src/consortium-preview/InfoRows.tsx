export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 text-sm md:grid-cols-[150px_1fr] md:text-[15px]">
      <span className="font-semibold text-slate-800">{label}</span>
      <span className="break-words text-slate-700">{value || " "}</span>
    </div>
  );
}

export function MetricRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "negative"
        ? "text-red-700"
        : "text-slate-800";

  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm md:text-[15px]">
      <span className="text-slate-700">{label}</span>
      <span className={`shrink-0 text-right font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}
