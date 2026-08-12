import { useNavigate } from "react-router-dom";
import { Calculator } from "lucide-react";
import QuoterCalculator, { QuoterPrefill } from "@/components/admin/QuoterCalculator";

const Quoter = () => {
  const navigate = useNavigate();

  const handleApply = (prefill: QuoterPrefill) => {
    navigate("/admin/presupuestos/nuevo", { state: { prefill } });
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-foreground/[0.06] flex items-center justify-center">
          <Calculator size={18} className="text-foreground/70" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Cotizador</h1>
          <p className="text-sm text-foreground/50">Estimación de horas, costos y precio sugerido.</p>
        </div>
      </header>

      <QuoterCalculator onApply={handleApply} />
    </div>
  );
};

export default Quoter;
