import type { ReactNode } from "react";

export default function SectionCard({
  title,
  icon,
  accent = "blue",
  children,
  className = "",
}: {
  title: string;
  icon: ReactNode;
  accent?: "blue" | "gold";
  children: ReactNode;
  className?: string;
}) {
  const headerClass =
    accent === "gold"
      ? "bg-gradient-to-r from-[#be8a2b] to-[#d7aa56]"
      : "bg-gradient-to-r from-[#073b53] to-[#0d4960]";

  return (
    <section className={`receipt-card receipt-section overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(8,35,48,0.08)] print:break-inside-avoid print:rounded-[14px] print:shadow-none ${className}`}>
      <div className={`${headerClass} flex items-center gap-3 px-4 py-3 text-white print:px-3 print:py-2`}>
        <div className="shrink-0">{icon}</div>
        <h3 className="text-base font-semibold uppercase tracking-[0.08em] md:text-lg">
          {title}
        </h3>
      </div>
      <div className="px-4 py-4 md:px-5 md:py-5 print:px-3 print:py-3">{children}</div>
    </section>
  );
}
