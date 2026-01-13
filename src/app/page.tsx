"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  CheckCircle2,
  ChevronRight,
  Construction,
  FlaskConical,
  Layers,
  LayoutDashboard,
  ArrowRight,
  Activity,
  Settings,
  Scale,
  TrendingUp,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// --- Domain Interfaces ---
interface ConcreteMaterials {
  cement: { type: string; density: number; f28: number };
  sand: { modulus: number; density: number; unitMass: number };
  gravel: { maxDiameter: number; density: number; unitMass: number };
}

interface TargetParameters {
  fck: number;
  standardDeviation: number;
  slump: number;
}

interface MixResult {
  trace: { cement: number; sand: number; gravel: number; water: number };
  consumption: { cement: number; sand: number; gravel: number; water: number };
  ratio: string;
}

// --- Mock Data & Calculation Logic (Client-Side Simulation) ---
const SIMULATE_CALCULATION = (
  target: TargetParameters,
  materials: ConcreteMaterials
): MixResult => {
  const fcj = target.fck + 1.65 * target.standardDeviation;
  const wcRatio = Math.max(
    0.3,
    Math.min(0.8, (Math.log(68) - Math.log(fcj)) / Math.log(11))
  );

  let waterContent = 205;
  if (target.slump > 100) waterContent += 10;
  if (materials.gravel.maxDiameter > 25) waterContent -= 15;

  const cementConsumption = waterContent / wcRatio;
  const volumeCement = cementConsumption / materials.cement.density;
  const volumeWater = waterContent;
  const volumeAggregates = 1000 - volumeCement - volumeWater;
  const idealSandPercent = 0.45;

  const volumeSand = volumeAggregates * idealSandPercent;
  const volumeGravel = volumeAggregates * (1 - idealSandPercent);

  const sandConsumption = volumeSand * materials.sand.density;
  const gravelConsumption = volumeGravel * materials.gravel.density;

  const a = sandConsumption / cementConsumption;
  const p = gravelConsumption / cementConsumption;
  const wc = wcRatio;

  return {
    trace: { cement: 1, sand: a, gravel: p, water: wc },
    consumption: {
      cement: Math.round(cementConsumption),
      sand: Math.round(sandConsumption),
      gravel: Math.round(gravelConsumption),
      water: Math.round(waterContent),
    },
    ratio: `1 : ${a.toFixed(2)} : ${p.toFixed(2)} : ${wc.toFixed(2)}`,
  };
};

// --- UI Components ---

const Card = ({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) => (
  <div
    className={cn(
      "bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-xl",
      hover &&
        "hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300",
      className
    )}
  >
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 ml-1">
    {children}
  </label>
);

const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
    {...props}
  />
);

const Select = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
      <ChevronRight className="w-4 h-4 rotate-90" />
    </div>
  </div>
);

const StepIndicator = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <div className="flex items-center space-x-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-2 rounded-full transition-all duration-500",
          i + 1 === current
            ? "w-12 bg-amber-500"
            : i + 1 < current
            ? "w-4 bg-amber-500/40"
            : "w-2 bg-zinc-800"
        )}
      />
    ))}
    <span className="ml-auto text-xs font-medium text-zinc-500">
      Passo {current} de {total}
    </span>
  </div>
);

// --- Main Page Component ---

export default function ConcreteMixPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<MixResult | null>(null);
  const [showExportToast, setShowExportToast] = useState(false);

  const [target, setTarget] = useState<TargetParameters>({
    fck: 25,
    standardDeviation: 4.0,
    slump: 100,
  });

  const [materials, setMaterials] = useState<ConcreteMaterials>({
    cement: { type: "CP II-E-32", density: 3.1, f28: 32 },
    sand: { modulus: 2.4, density: 2.65, unitMass: 1.55 },
    gravel: { maxDiameter: 19, density: 2.7, unitMass: 1.45 },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCalculate = async () => {
    setIsCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = SIMULATE_CALCULATION(target, materials);
    setResult(data);
    setIsCalculating(false);
    setStep(3);
  };

  const handleExport = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  const volumeData = useMemo(() => {
    if (!result) return [];
    return [
      { name: "Cimento", value: result.consumption.cement, color: "#f59e0b" },
      { name: "Areia", value: result.consumption.sand, color: "#fbbf24" },
      { name: "Brita", value: result.consumption.gravel, color: "#71717a" },
      { name: "Água", value: result.consumption.water, color: "#3b82f6" },
    ];
  }, [result]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono">
        Carregando Interface Enterprise...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      {/* Toast Notification */}
      <div
        className={cn(
          "fixed top-4 right-4 z-50 bg-zinc-800 text-white px-6 py-4 rounded-xl shadow-2xl border border-zinc-700 flex items-center gap-3 transition-all duration-500 transform",
          showExportToast
            ? "translate-y-0 opacity-100"
            : "-translate-y-24 opacity-0"
        )}
      >
        <CheckCircle2 className="text-green-500 w-6 h-6" />
        <div>
          <h4 className="font-bold text-sm">Relatório Exportado</h4>
          <p className="text-xs text-zinc-400">PDF gerado com sucesso.</p>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Sidebar / Navigation */}
        <aside className="lg:w-72 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md p-6 flex-col justify-between hidden lg:flex fixed h-full z-20">
          <div>
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Construction className="text-zinc-950 w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Método IPT</h1>
                <p className="text-xs text-zinc-500">Design de Concreto</p>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: false },
                {
                  icon: FlaskConical,
                  label: "Calculadora de Traço",
                  active: true,
                },
                { icon: Layers, label: "Projetos Salvos", active: false },
                { icon: Scale, label: "Materiais DB", active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    item.active
                      ? "bg-amber-500/10 text-amber-500"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      item.active
                        ? "text-amber-500"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">
                Status do Sistema
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Biblioteca IPT v2.4 Carregada
            </p>
          </div>
        </aside>

        {/* Mobile Nav Header */}
        <header className="lg:hidden p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Construction className="text-zinc-950 w-5 h-5" />
            </div>
            <span className="font-bold">IPT Design</span>
          </div>
          <button className="text-zinc-400">
            <Settings className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-zinc-100 mb-2">
                  Novo Design de Traço
                </h2>
                <p className="text-zinc-400">
                  Configure os parâmetros para o método de dosagem experimental
                  IPT (ABC).
                </p>
              </div>
              <div className="flex gap-2">
                {result && (
                  <button
                    onClick={() => {
                      setStep(1);
                      setResult(null);
                    }}
                    className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Resetar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Inputs (Wizard) */}
              <div className="lg:col-span-7 space-y-6">
                <StepIndicator current={step} total={3} />

                {/* STEP 1: TARGET PARAMETERS */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <Card hover>
                      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            Requisitos do Alvo
                          </h3>
                          <p className="text-sm text-zinc-500">
                            Defina as necessidades estruturais.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Label>Resistência Característica (Fck)</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={target.fck}
                              onChange={(e) =>
                                setTarget({
                                  ...target,
                                  fck: Number(e.target.value),
                                })
                              }
                            />
                            <span className="absolute right-4 top-3 text-zinc-500 text-sm">
                              MPa
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 pt-1">
                            Min: 20 MPa para concreto estrutural
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label>Desvio Padrão (Sd)</Label>
                          <Input
                            type="number"
                            value={target.standardDeviation}
                            onChange={(e) =>
                              setTarget({
                                ...target,
                                standardDeviation: Number(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-1">
                          <div className="flex justify-between">
                            <Label>Slump (Abatimento)</Label>
                            <span className="text-amber-500 font-mono text-sm">
                              {target.slump} mm
                            </span>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="220"
                            step="10"
                            value={target.slump}
                            onChange={(e) =>
                              setTarget({
                                ...target,
                                slump: Number(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <div className="flex justify-between text-[10px] text-zinc-600 px-1 pt-2">
                            <span>Seco (40)</span>
                            <span>Plástico (100)</span>
                            <span>Fluido (220)</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-zinc-100 text-zinc-950 font-bold py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-white/5"
                    >
                      Próximo Passo{" "}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* STEP 2: MATERIALS */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Card hover>
                      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            Propriedades dos Materiais
                          </h3>
                          <p className="text-sm text-zinc-500">
                            Especificações dos materiais disponíveis.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Cement Section */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>{" "}
                            Cimento
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Tipo</Label>
                              <Select
                                options={[
                                  "CP I-32",
                                  "CP II-E-32",
                                  "CP II-Z-32",
                                  "CP III-40",
                                  "CP V-ARI",
                                ]}
                                value={materials.cement.type}
                                onChange={(v) =>
                                  setMaterials({
                                    ...materials,
                                    cement: { ...materials.cement, type: v },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Densidade (g/cm³)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={materials.cement.density}
                                onChange={(e) =>
                                  setMaterials({
                                    ...materials,
                                    cement: {
                                      ...materials.cement,
                                      density: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Aggregates Section */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{" "}
                            Agregado Miúdo (Areia)
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Módulo de Finura</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={materials.sand.modulus}
                                onChange={(e) =>
                                  setMaterials({
                                    ...materials,
                                    sand: {
                                      ...materials.sand,
                                      modulus: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Massa Unitária (kg/dm³)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={materials.sand.unitMass}
                                onChange={(e) =>
                                  setMaterials({
                                    ...materials,
                                    sand: {
                                      ...materials.sand,
                                      unitMass: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-4 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        className="flex-1 bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCalculating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                            Calculando...
                          </>
                        ) : (
                          <>
                            Calcular Traço <Calculator className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: RESULTS (Detailed breakdown for mobile/desktop flow) */}
                {step === 3 && result && (
                  <div className="lg:hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                      <h3 className="text-amber-500 font-bold mb-1">
                        Cálculo Completo
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Dosagem otimizada para {target.fck} MPa
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Preview & Results */}
              <div className="lg:col-span-5 space-y-6">
                {/* Always visible Summary Card */}
                <Card className="bg-zinc-900/80 sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-zinc-100">
                      Especificações Projetadas
                    </h3>
                    <TrendingUp className="w-5 h-5 text-zinc-500" />
                  </div>

                  {!result ? (
                    <div className="space-y-6">
                      {/* Empty State / Preview of inputs */}
                      <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
                        <span className="text-sm text-zinc-500">Fck Alvo</span>
                        <span className="text-xl font-mono font-bold text-zinc-300">
                          {target.fck}{" "}
                          <span className="text-xs text-zinc-600">MPa</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
                        <span className="text-sm text-zinc-500">
                          Fck Dosagem (Fcj)
                        </span>
                        <span className="text-xl font-mono font-bold text-amber-500">
                          {(
                            target.fck +
                            1.65 * target.standardDeviation
                          ).toFixed(1)}{" "}
                          <span className="text-xs text-zinc-600">MPa</span>
                        </span>
                      </div>

                      <div className="bg-zinc-950 rounded-lg p-4 mt-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px] border border-zinc-800 border-dashed">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                          <Construction className="w-6 h-6 text-zinc-700" />
                        </div>
                        <p className="text-sm text-zinc-500 max-w-[200px]">
                          Complete os passos para gerar o diagrama de mistura e
                          o relatório de consumo.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                      {/* Result State */}
                      <div className="text-center p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
                          Traço Unitário (Massa)
                        </h4>
                        <div className="text-4xl lg:text-5xl font-black text-white tracking-tight font-mono">
                          1 : {result.trace.sand.toFixed(2)} :{" "}
                          {result.trace.gravel.toFixed(2)}
                        </div>
                        <div className="text-lg text-amber-500/80 font-mono mt-1 font-medium">
                          a/c = {result.trace.water.toFixed(2)}
                        </div>
                      </div>

                      {/* Consumption Table */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-400">
                          Consumo de Materiais (kg/m³)
                        </h4>
                        {[
                          {
                            label: "Cimento",
                            value: result.consumption.cement,
                            color: "bg-amber-500",
                          },
                          {
                            label: "Areia",
                            value: result.consumption.sand,
                            color: "bg-amber-300",
                          },
                          {
                            label: "Brita",
                            value: result.consumption.gravel,
                            color: "bg-zinc-600",
                          },
                          {
                            label: "Água",
                            value: result.consumption.water,
                            color: "bg-blue-500",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${item.color}`}
                              />
                              <span className="text-sm text-zinc-300">
                                {item.label}
                              </span>
                            </div>
                            <span className="font-mono font-medium text-zinc-100 group-hover:text-amber-500 transition-colors">
                              {item.value}{" "}
                              <span className="text-zinc-600 text-xs">kg</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Chart */}
                      <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={volumeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {volumeData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: "#18181b",
                                borderColor: "#27272a",
                                borderRadius: "8px",
                                color: "#fff",
                              }}
                              itemStyle={{ color: "#fff" }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
                        <button
                          onClick={handleExport}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Printer className="w-4 h-4" /> Imprimir PDF
                        </button>
                        <button
                          onClick={handleExport}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" /> Exportar CSV
                        </button>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg text-blue-400 text-xs">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>
                            Valores estimados baseados no método IPT. Sempre
                            realize ajustes experimentais em betoneira antes da
                            produção.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
