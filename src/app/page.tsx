"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DosageCharts from "@/components/dosage-charts";
import UnifiedIPTDiagram from "@/components/unified-ipt-diagram";
import {
  Calculator,
  CheckCircle2,
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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- ICONS ---
function ConcreteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M11.66 12a3.83 3.83 0 1 1-3.26-6.42" />
        <path d="M12.9 6.88a4.57 4.57 0 0 1 .59 6.33" />
        <path d="M12.63 15.11a7.1 7.1 0 0 1-8.12-8.57" />
        <path d="M4.51 6.54A7.43 7.43 0 0 1 12 4.5" />
        <path d="M15.82 9.09a3.83 3.83 0 1 1-3.26 6.42" />
        <path d="M12 18.25a4.57 4.57 0 0 1-2.92-1.07" />
        <path d="m11.37 8.89l8.12 8.57" />
        <path d="M19.49 17.46A7.43 7.43 0 0 1 12 19.5" />
      </g>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// --- TYPES & SCHEMA ---

const formSchema = z.object({
  experimentalPoints: z
    .array(
      z.object({
        m: z.coerce.number().positive(),
        ac: z.coerce.number().positive().max(1),
        fcj: z.coerce.number().positive(),
        density: z.coerce.number().min(1500).max(3000),
      })
    )
    .min(3),
  target: z.object({
    fck: z.coerce.number().min(10).max(100),
    sd: z.coerce.number().min(2).max(10),
    aggressivenessClass: z.coerce.number().min(1).max(4),
    elementType: z.enum(["CA", "CP"]),
    slump: z.coerce.number().min(0).max(250),
    mortarContent: z.coerce.number().min(40).max(65),
  }),
  containerConfig: z
    .object({
      enabled: z.boolean(),
      shape: z.enum(["rectangular", "circular"]),
      lengthCm: z.coerce.number().positive().optional(),
      widthCm: z.coerce.number().positive().optional(),
      heightCm: z.coerce.number().positive().optional(),
      concreteVolume: z.coerce.number().positive().optional(),
    })
    .optional(),
});

interface FormData {
  experimentalPoints: {
    m: number;
    ac: number;
    fcj: number;
    density: number;
  }[];
  target: {
    fck: number;
    sd: number;
    aggressivenessClass: number;
    elementType: "CA" | "CP";
    slump: number;
    mortarContent: number;
  };
  containerConfig?: {
    enabled: boolean;
    shape: "rectangular" | "circular";
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    concreteVolume?: number;
  };
}

const defaultValues: FormData = {
  experimentalPoints: [
    { m: 3.5, ac: 0.38, fcj: 48.3, density: 2470 },
    { m: 5.0, ac: 0.53, fcj: 32.1, density: 2390 },
    { m: 6.5, ac: 0.69, fcj: 19.8, density: 2280 },
  ],
  target: {
    fck: 30,
    sd: 4,
    aggressivenessClass: 2,
    elementType: "CA",
    slump: 100,
    mortarContent: 49,
  },
  containerConfig: {
    enabled: false,
    shape: "rectangular",
    lengthCm: 30,
    widthCm: 20,
    heightCm: 25,
    concreteVolume: 1.0,
  },
};

type DosageResult = {
  success: boolean;
  data?: {
    finalTrace: {
      sand: number;
      gravel: number;
      water: number;
      ratio: string;
    };
    consumption: {
      cement: number;
      sand: number;
      gravel: number;
      water: number;
    };
    coefficients: {
      abrams: { k1: number; k2: number; r2: number };
      lyse: { k3: number; k4: number; r2: number };
      molinari: { k5: number; k6: number; r2: number };
    };
    parameters: {
      fcjTarget: number;
      targetAC: number;
      targetM: number;
    };
    experimentalRange?: {
      minFcj: number;
      maxFcj: number;
      isExtrapolating: boolean;
      extrapolationPercent?: number;
    };
    batchResult?: {
      containerVolume: number;
      totalVolume: number;
      numberOfBatches: number;
      perBatch: { cement: number; sand: number; gravel: number; water: number };
      total: { cement: number; sand: number; gravel: number; water: number };
    };
    warnings: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: { path: string[]; message: string }[];
  };
};

// --- Step Indicator Component ---
const StepIndicator = ({
  current,
  total,
  darkMode,
}: {
  current: number;
  total: number;
  darkMode: boolean;
}) => (
  <div className="flex items-center space-x-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-2 rounded-full transition-all duration-500",
          i + 1 === current
            ? darkMode
              ? "w-12 bg-emerald-500"
              : "w-12 bg-emerald-600"
            : i + 1 < current
            ? darkMode
              ? "w-4 bg-emerald-500/40"
              : "w-4 bg-emerald-600/40"
            : darkMode
            ? "w-2 bg-slate-700"
            : "w-2 bg-gray-300"
        )}
      />
    ))}
    <span
      className={cn(
        "ml-auto text-xs font-medium",
        darkMode ? "text-slate-500" : "text-gray-500"
      )}
    >
      Passo {current} de {total}
    </span>
  </div>
);

// --- COMPONENT ---

export default function PlaygroundPage() {
  const [result, setResult] = useState<DosageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const { register, control, handleSubmit, setValue, watch } =
    useForm<FormData>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(formSchema) as any,
      defaultValues,
    });

  const { fields } = useFieldArray({
    control,
    name: "experimentalPoints",
  });

  const traceLabels = ["Rico", "Piloto", "Pobre"];
  const experimentalPoints = watch("experimentalPoints");
  const target = watch("target");

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        experimentalPoints: data.experimentalPoints,
        target: data.target,
      };

      if (
        data.containerConfig?.enabled &&
        data.containerConfig.lengthCm &&
        data.containerConfig.heightCm &&
        data.containerConfig.concreteVolume
      ) {
        const lengthM = data.containerConfig.lengthCm / 100;
        const widthM =
          (data.containerConfig.widthCm || data.containerConfig.lengthCm) / 100;
        const heightM = data.containerConfig.heightCm / 100;

        payload.containerConfig = {
          shape: data.containerConfig.shape,
          length: lengthM,
          width: widthM,
          height: heightM,
          totalVolume: data.containerConfig.concreteVolume,
        };
      }

      const response = await fetch("/api/v1/dosage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      setResult(json);
      if (json.success) {
        setStep(3);
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setResult({
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message:
            "Não foi possível conectar ao servidor. Verifique se a API está rodando.",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  // Theme-based colors
  const colors = {
    bg: darkMode ? "bg-slate-950" : "bg-gray-50",
    cardBg: darkMode
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-gray-200",
    cardHover: darkMode ? "hover:border-slate-700" : "hover:border-gray-300",
    text: darkMode ? "text-white" : "text-gray-900",
    textMuted: darkMode ? "text-slate-400" : "text-gray-500",
    inputBg: darkMode
      ? "bg-slate-800 border-slate-700 text-white"
      : "bg-white border-gray-200 text-gray-900",
    accent: darkMode ? "bg-emerald-600" : "bg-emerald-500",
    accentText: darkMode ? "text-emerald-400" : "text-emerald-700",
    sidebarBg: darkMode
      ? "bg-slate-950/80 border-slate-800"
      : "bg-white/80 border-gray-200",
  };

  return (
    <div
      className={cn("min-h-screen transition-colors duration-300", colors.bg)}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={cn(
            "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full",
            darkMode ? "bg-emerald-500/5" : "bg-emerald-500/10"
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] blur-[120px] rounded-full",
            darkMode ? "bg-blue-500/5" : "bg-blue-500/10"
          )}
        />
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Sidebar / Navigation */}
        <aside
          className={cn(
            "lg:w-72 border-r backdrop-blur-md p-6 flex-col justify-between hidden lg:flex fixed h-full z-20",
            colors.sidebarBg
          )}
        >
          <div>
            <div className="flex items-center gap-3 mb-10 px-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                  colors.accent,
                  darkMode ? "shadow-emerald-900/20" : "shadow-emerald-500/20"
                )}
              >
                <ConcreteIcon />
              </div>
              <div>
                <h1
                  className={cn("font-bold text-lg leading-tight", colors.text)}
                >
                  Dosagem IPT/EPUSP
                </h1>
                <p className={cn("text-xs", colors.textMuted)}>
                  Calculadora de Concreto
                </p>
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
                      ? darkMode
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-emerald-500/10 text-emerald-700"
                      : darkMode
                      ? "text-slate-400 hover:bg-slate-900 hover:text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      item.active
                        ? darkMode
                          ? "text-emerald-400"
                          : "text-emerald-600"
                        : darkMode
                        ? "text-slate-500 group-hover:text-slate-300"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className={cn("rounded-xl p-4 border", colors.cardBg)}>
            <div
              className={cn("flex items-center gap-2 mb-2", colors.accentText)}
            >
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">
                Status do Sistema
              </span>
            </div>
            <p className={cn("text-xs", colors.textMuted)}>
              Biblioteca IPT v2.4 Carregada
            </p>
          </div>
        </aside>

        {/* Mobile Nav Header */}
        <header
          className={cn(
            "lg:hidden p-4 border-b flex items-center justify-between backdrop-blur sticky top-0 z-30",
            darkMode
              ? "border-slate-800 bg-slate-950/90"
              : "border-gray-200 bg-white/90"
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                colors.accent
              )}
            >
              <Construction className="w-5 h-5" />
            </div>
            <span className={cn("font-bold", colors.text)}>IPT Design</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                darkMode
                  ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className={colors.textMuted}>
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div
              className={cn(
                "border-b pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4",
                darkMode ? "border-slate-800" : "border-gray-200"
              )}
            >
              <div>
                <h2 className={cn("text-2xl font-bold mb-1", colors.text)}>
                  Novo Design de Traço
                </h2>
                <p className={colors.textMuted}>
                  Configure os parâmetros para o método de dosagem experimental
                  IPT/EPUSP.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/fcfim/Concrete-Mix-Design-IPT-Method"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    darkMode
                      ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                  )}
                >
                  <GitHubIcon />
                </a>
                <a
                  href="https://linkedin.com/in/filipefim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    darkMode
                      ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                  )}
                >
                  <LinkedInIcon />
                </a>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 hidden lg:block",
                    darkMode
                      ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {darkMode ? <SunIcon /> : <MoonIcon />}
                </button>
                {result?.success && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setResult(null);
                    }}
                    className={darkMode ? "border-slate-700" : ""}
                  >
                    Resetar
                  </Button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Input Form */}
                <div className="lg:col-span-5 space-y-6">
                  <StepIndicator current={step} total={3} darkMode={darkMode} />

                  {/* STEP 1: EXPERIMENTAL POINTS */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                      <Card
                        className={cn(
                          "border shadow-sm transition-all",
                          colors.cardBg,
                          colors.cardHover
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                darkMode
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-emerald-500/10 text-emerald-600"
                              )}
                            >
                              <FlaskConical className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className={colors.text}>
                                Pontos Experimentais
                              </CardTitle>
                              <CardDescription className={colors.textMuted}>
                                Dados dos traços Rico, Piloto e Pobre
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {fields.map((field, index) => (
                            <div
                              key={field.id}
                              className={cn(
                                "p-4 rounded-xl border",
                                darkMode
                                  ? "bg-slate-950/50 border-slate-800"
                                  : "bg-gray-50/80 border-gray-100"
                              )}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className={cn(
                                    "text-sm font-bold uppercase tracking-wider",
                                    colors.accentText
                                  )}
                                >
                                  Traço {traceLabels[index]}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label
                                    className={cn("text-xs", colors.textMuted)}
                                  >
                                    Traço (m)
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    className={cn(
                                      "h-9 text-sm",
                                      colors.inputBg
                                    )}
                                    {...register(
                                      `experimentalPoints.${index}.m`
                                    )}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    className={cn("text-xs", colors.textMuted)}
                                  >
                                    a/c
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className={cn(
                                      "h-9 text-sm",
                                      colors.inputBg
                                    )}
                                    {...register(
                                      `experimentalPoints.${index}.ac`
                                    )}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    className={cn("text-xs", colors.textMuted)}
                                  >
                                    fcj (MPa)
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    className={cn(
                                      "h-9 text-sm",
                                      colors.inputBg
                                    )}
                                    {...register(
                                      `experimentalPoints.${index}.fcj`
                                    )}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    className={cn("text-xs", colors.textMuted)}
                                  >
                                    Dens. (kg/m³)
                                  </Label>
                                  <Input
                                    type="number"
                                    step="1"
                                    className={cn(
                                      "h-9 text-sm",
                                      colors.inputBg
                                    )}
                                    {...register(
                                      `experimentalPoints.${index}.density`
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        className={cn(
                          "w-full py-6 text-base font-bold shadow-lg transition-all group",
                          darkMode
                            ? "bg-slate-100 text-slate-900 hover:bg-white"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        )}
                      >
                        Próximo Passo{" "}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}

                  {/* STEP 2: TARGET PARAMETERS */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <Card
                        className={cn(
                          "border shadow-sm transition-all",
                          colors.cardBg,
                          colors.cardHover
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                darkMode
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-blue-500/10 text-blue-600"
                              )}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className={colors.text}>
                                Especificações do Concreto
                              </CardTitle>
                              <CardDescription className={colors.textMuted}>
                                Parâmetros de projeto desejados
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                fck (MPa)
                              </Label>
                              <Input
                                type="number"
                                className={colors.inputBg}
                                {...register("target.fck")}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Desvio Padrão
                              </Label>
                              <Input
                                type="number"
                                step="0.1"
                                className={colors.inputBg}
                                {...register("target.sd")}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Agressividade
                              </Label>
                              <Select
                                defaultValue="2"
                                onValueChange={(v) =>
                                  setValue(
                                    "target.aggressivenessClass",
                                    parseInt(v)
                                  )
                                }
                              >
                                <SelectTrigger className={colors.inputBg}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">I - Fraca</SelectItem>
                                  <SelectItem value="2">
                                    II - Moderada
                                  </SelectItem>
                                  <SelectItem value="3">III - Forte</SelectItem>
                                  <SelectItem value="4">
                                    IV - Muito Forte
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Tipo Elemento
                              </Label>
                              <Select
                                defaultValue="CA"
                                onValueChange={(v) =>
                                  setValue(
                                    "target.elementType",
                                    v as "CA" | "CP"
                                  )
                                }
                              >
                                <SelectTrigger className={colors.inputBg}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CA">
                                    Concreto Armado
                                  </SelectItem>
                                  <SelectItem value="CP">
                                    Concreto Protendido
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Abatimento (mm)
                              </Label>
                              <Input
                                type="number"
                                className={colors.inputBg}
                                {...register("target.slump")}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Teor Argamassa (%)
                              </Label>
                              <Input
                                type="number"
                                className={colors.inputBg}
                                {...register("target.mortarContent")}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Container Config */}
                      <Card
                        className={cn(
                          "border shadow-sm transition-all",
                          colors.cardBg,
                          colors.cardHover
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  darkMode
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-amber-500/10 text-amber-600"
                                )}
                              >
                                <Layers className="w-5 h-5" />
                              </div>
                              <div>
                                <CardTitle className={colors.text}>
                                  📦 Cálculo de Betonadas
                                </CardTitle>
                                <CardDescription className={colors.textMuted}>
                                  Opcional: dimensões do recipiente
                                </CardDescription>
                              </div>
                            </div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded"
                                {...register("containerConfig.enabled")}
                              />
                              <span className={cn("text-sm", colors.textMuted)}>
                                Ativar
                              </span>
                            </label>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Comprimento (cm)
                              </Label>
                              <Input
                                type="number"
                                className={colors.inputBg}
                                {...register("containerConfig.lengthCm")}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Largura (cm)
                              </Label>
                              <Input
                                type="number"
                                className={colors.inputBg}
                                {...register("containerConfig.widthCm")}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Altura (cm)
                              </Label>
                              <Input
                                type="number"
                                className={colors.inputBg}
                                {...register("containerConfig.heightCm")}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className={colors.textMuted}>
                                Volume Total (m³)
                              </Label>
                              <Input
                                type="number"
                                step="0.1"
                                className={colors.inputBg}
                                {...register("containerConfig.concreteVolume")}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className={cn(
                            "px-6 py-6",
                            darkMode ? "border-slate-700" : ""
                          )}
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className={cn(
                            "flex-1 py-6 text-base font-bold shadow-lg",
                            darkMode
                              ? "bg-emerald-600 hover:bg-emerald-500"
                              : "bg-emerald-500 hover:bg-emerald-600"
                          )}
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Calculando...
                            </>
                          ) : (
                            <>
                              Calcular Traço{" "}
                              <Calculator className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Show compact summary on mobile */}
                  {step === 3 && result?.success && (
                    <div className="lg:hidden space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
                      <Card className={cn("border", colors.cardBg)}>
                        <CardHeader>
                          <CardTitle
                            className={cn(
                              "flex items-center gap-2",
                              colors.accentText
                            )}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Cálculo Completo
                          </CardTitle>
                          <CardDescription className={colors.textMuted}>
                            Dosagem otimizada para {target.fck} MPa
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={cn(
                              "text-center p-4 rounded-xl border mb-4",
                              darkMode
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-emerald-50 border-emerald-200"
                            )}
                          >
                            <p
                              className={cn(
                                "text-xs font-bold uppercase tracking-widest mb-1",
                                colors.accentText
                              )}
                            >
                              Traço Unitário
                            </p>
                            <p
                              className={cn(
                                "text-3xl font-black font-mono",
                                colors.text
                              )}
                            >
                              1 : {result.data?.finalTrace.sand.toFixed(2)} :{" "}
                              {result.data?.finalTrace.gravel.toFixed(2)}
                            </p>
                            <p
                              className={cn(
                                "text-lg font-mono mt-1",
                                colors.accentText
                              )}
                            >
                              a/c = {result.data?.finalTrace.water.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setStep(1)}
                            variant="outline"
                            className="w-full"
                          >
                            Nova Dosagem
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Results */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Live Preview Card */}
                  <Card
                    className={cn(
                      "border shadow-sm sticky top-6",
                      colors.cardBg
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={colors.text}>
                          Especificações Projetadas
                        </CardTitle>
                        <TrendingUp
                          className={cn("w-5 h-5", colors.textMuted)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!result?.success ? (
                        <div className="space-y-4">
                          <div
                            className={cn(
                              "flex justify-between items-center py-3 border-b",
                              darkMode
                                ? "border-slate-800/50"
                                : "border-gray-100"
                            )}
                          >
                            <span className={cn("text-sm", colors.textMuted)}>
                              Fck Alvo
                            </span>
                            <span
                              className={cn(
                                "text-xl font-mono font-bold",
                                colors.text
                              )}
                            >
                              {target.fck}{" "}
                              <span className={cn("text-xs", colors.textMuted)}>
                                MPa
                              </span>
                            </span>
                          </div>
                          <div
                            className={cn(
                              "flex justify-between items-center py-3 border-b",
                              darkMode
                                ? "border-slate-800/50"
                                : "border-gray-100"
                            )}
                          >
                            <span className={cn("text-sm", colors.textMuted)}>
                              Fck Dosagem (Fcj)
                            </span>
                            <span
                              className={cn(
                                "text-xl font-mono font-bold",
                                colors.accentText
                              )}
                            >
                              {(target.fck + 1.65 * target.sd).toFixed(1)}{" "}
                              <span className={cn("text-xs", colors.textMuted)}>
                                MPa
                              </span>
                            </span>
                          </div>

                          <div
                            className={cn(
                              "rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[150px] border border-dashed",
                              darkMode
                                ? "bg-slate-950 border-slate-800"
                                : "bg-gray-50 border-gray-200"
                            )}
                          >
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center",
                                darkMode ? "bg-slate-900" : "bg-gray-100"
                              )}
                            >
                              <Construction
                                className={cn("w-6 h-6", colors.textMuted)}
                              />
                            </div>
                            <p
                              className={cn(
                                "text-sm max-w-[220px]",
                                colors.textMuted
                              )}
                            >
                              Complete os passos para gerar o diagrama de
                              mistura e o relatório de consumo.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                          {/* Result State */}
                          <div
                            className={cn(
                              "text-center p-6 rounded-2xl relative overflow-hidden",
                              darkMode
                                ? "bg-emerald-500/10 border border-emerald-500/20"
                                : "bg-emerald-50 border border-emerald-200"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50",
                                colors.accentText
                              )}
                            />
                            <h4
                              className={cn(
                                "text-xs font-bold uppercase tracking-widest mb-2",
                                colors.accentText
                              )}
                            >
                              Traço Unitário (Massa)
                            </h4>
                            <div
                              className={cn(
                                "text-4xl lg:text-5xl font-black tracking-tight font-mono",
                                colors.text
                              )}
                            >
                              1 : {result.data?.finalTrace.sand.toFixed(2)} :{" "}
                              {result.data?.finalTrace.gravel.toFixed(2)}
                            </div>
                            <div
                              className={cn(
                                "text-lg font-mono mt-1 font-medium",
                                colors.accentText
                              )}
                            >
                              a/c = {result.data?.finalTrace.water.toFixed(2)}
                            </div>
                          </div>

                          {/* Consumption Table */}
                          <div className="space-y-2">
                            <h4
                              className={cn(
                                "text-sm font-semibold",
                                colors.textMuted
                              )}
                            >
                              Consumo de Materiais (kg/m³)
                            </h4>
                            {[
                              {
                                label: "Cimento",
                                value: result.data?.consumption.cement,
                                color: darkMode
                                  ? "bg-emerald-500"
                                  : "bg-emerald-600",
                              },
                              {
                                label: "Areia",
                                value: result.data?.consumption.sand,
                                color: "bg-amber-500",
                              },
                              {
                                label: "Brita",
                                value: result.data?.consumption.gravel,
                                color: "bg-gray-500",
                              },
                              {
                                label: "Água",
                                value: result.data?.consumption.water,
                                color: "bg-blue-500",
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center justify-between group py-1"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full",
                                      item.color
                                    )}
                                  />
                                  <span className={cn("text-sm", colors.text)}>
                                    {item.label}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    "font-mono font-medium transition-colors",
                                    colors.text,
                                    darkMode
                                      ? "group-hover:text-emerald-400"
                                      : "group-hover:text-emerald-600"
                                  )}
                                >
                                  {item.value}{" "}
                                  <span
                                    className={cn("text-xs", colors.textMuted)}
                                  >
                                    kg
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Warnings */}
                          {result.data?.warnings &&
                            result.data.warnings.length > 0 && (
                              <Alert
                                className={
                                  darkMode
                                    ? "bg-amber-500/10 border-amber-500/20"
                                    : "bg-amber-50 border-amber-200"
                                }
                              >
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <AlertTitle
                                  className={
                                    darkMode
                                      ? "text-amber-400"
                                      : "text-amber-700"
                                  }
                                >
                                  Avisos
                                </AlertTitle>
                                <AlertDescription className={colors.textMuted}>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    {result.data.warnings.map((w, i) => (
                                      <li key={i}>{w}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}

                          {/* Batch Results */}
                          {result.data?.batchResult && (
                            <div
                              className={cn(
                                "p-4 rounded-xl border",
                                colors.cardBg
                              )}
                            >
                              <h4
                                className={cn(
                                  "text-sm font-semibold mb-3",
                                  colors.text
                                )}
                              >
                                📦 Betonadas (
                                {result.data.batchResult.numberOfBatches}x)
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className={colors.textMuted}>
                                  Por betonada:
                                </div>
                                <div className={cn("font-mono", colors.text)}>
                                  C:{" "}
                                  {result.data.batchResult.perBatch.cement.toFixed(
                                    1
                                  )}
                                  kg
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Error Alert */}
                  {result && !result.success && result.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro: {result.error.code}</AlertTitle>
                      <AlertDescription>
                        {result.error.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Charts & Diagram */}
                  {result?.success && result.data && (
                    <>
                      <UnifiedIPTDiagram
                        experimentalPoints={experimentalPoints}
                        coefficients={result.data.coefficients}
                        parameters={result.data.parameters}
                        cementConsumption={result.data.consumption.cement}
                        darkMode={darkMode}
                      />

                      <DosageCharts
                        experimentalPoints={experimentalPoints}
                        coefficients={result.data.coefficients}
                        parameters={result.data.parameters}
                        cementConsumption={result.data.consumption.cement}
                        darkMode={darkMode}
                      />
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer
        className={cn(
          "lg:ml-72 border-t py-4 px-6",
          darkMode
            ? "border-slate-800 bg-slate-950"
            : "border-gray-200 bg-gray-50"
        )}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <p className={cn("text-sm", colors.textMuted)}>
            Desenvolvido por{" "}
            <a
              href="https://github.com/fcfim"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("font-medium hover:underline", colors.accentText)}
            >
              @fcfim
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/fcfim/Concrete-Mix-Design-IPT-Method"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm transition-colors",
                colors.textMuted,
                darkMode ? "hover:text-white" : "hover:text-gray-900"
              )}
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/filipefim"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm transition-colors",
                colors.textMuted,
                darkMode ? "hover:text-white" : "hover:text-gray-900"
              )}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
