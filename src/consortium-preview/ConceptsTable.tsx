import { money } from "../helpers";
import type { ExpenseReceiptConcept } from "../interfaz";

export default function ConceptsTable({
  concepts,
}: {
  concepts: ExpenseReceiptConcept[];
}) {
  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <div className="space-y-3">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className="grid grid-cols-[1fr_120px] items-center gap-3 text-sm md:grid-cols-[1fr_140px] md:text-[15px]"
          >
            <span className="break-words text-slate-700">{concept.description || " "}</span>
            <span className="text-right font-medium text-slate-900">
              {money(concept.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
