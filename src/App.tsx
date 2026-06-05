import { useState } from "react";
import "./App.css";
import ConsortiumReceiptGenerator from "./consortiumReceiptGenerator";
import ReceiptGenerator from "./generadorRecibo";
import "./index.css";

function App() {
  const [activeTab, setActiveTab] = useState<"inmobiliaria" | "consorcio">(
    "inmobiliaria",
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="mb-4 flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab("inmobiliaria")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "inmobiliaria"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Recibos Inmobiliaria
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("consorcio")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "consorcio"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Recibos de Consorcio
          </button>
        </div>

        {activeTab === "inmobiliaria" ? (
          <ReceiptGenerator />
        ) : (
          <ConsortiumReceiptGenerator />
        )}
      </div>
    </div>
  );
}

export default App;
