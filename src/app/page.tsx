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
      // Dimensions in centimeters for easier input (bucket, can, etc.)
      lengthCm: z.coerce.number().positive().optional(),
      widthCm: z.coerce.number().positive().optional(),
      heightCm: z.coerce.number().positive().optional(),
      // Total concrete volume desired in m³
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
    // Dimensions in centimeters
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    // Total concrete volume in m³
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
    lengthCm: 30, // 30cm = typical bucket diameter or padiola width
    widthCm: 20, // 20cm
    heightCm: 25, // 25cm ≈ 15L bucket
    concreteVolume: 1.0, // 1m³ of concrete
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

// --- COMPONENT ---

export default function PlaygroundPage() {
  const [result, setResult] = useState<DosageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // System preference detection
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      // User default is light mode as per previous request, so we keep it false initially
      // But we can respect user toggle if persisted (not implemented yet)
      // For now, defaulting to light mode as requested.
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const { register, control, handleSubmit, setValue } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any, // Explicit any for v4 compatibility
    defaultValues,
  });

  const { fields } = useFieldArray({
    control,
    name: "experimentalPoints",
  });

  const traceLabels = ["Rico", "Piloto", "Pobre"];

  async function onSubmit(data: FormData) {
    setLoading(true);
    // setResult(null); // Keep previous result to avoid flicker
    try {
      // Prepare API payload with optional containerConfig
      const payload: Record<string, unknown> = {
        experimentalPoints: data.experimentalPoints,
        target: data.target,
      };

      // Add containerConfig only if enabled and has dimensions
      if (
        data.containerConfig?.enabled &&
        data.containerConfig.lengthCm &&
        data.containerConfig.heightCm &&
        data.containerConfig.concreteVolume
      ) {
        // Convert cm to meters
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-950" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b sticky top-0 z-50 backdrop-blur-sm ${
          darkMode
            ? "border-slate-800 bg-slate-900/80"
            : "border-gray-200 bg-white/80"
        }`}
      >
        <div className="container mx-auto px-4 py-4 max-w-[1600px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg ${
                darkMode
                  ? "bg-emerald-600 shadow-emerald-900/20"
                  : "bg-emerald-500 shadow-emerald-500/20"
              }`}
            >
              <ConcreteIcon />
            </div>
            <div>
              <h1
                className={`text-xl font-bold tracking-tight ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dosagem IPT/EPUSP
              </h1>
              <p
                className={`text-xs font-medium uppercase tracking-wider ${
                  darkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Calculadora de Concreto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/fcfim/Concrete-Mix-Design-IPT-Method"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}
                title="Repositório GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://linkedin.com/in/filipefim"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}
                title="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? "bg-slate-800 text-yellow-400 hover:bg-slate-700 hover:text-yellow-300 shadow-inner"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 shadow-sm"
              }`}
              title={darkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View Dashboard */}
      <main className="container mx-auto px-4 py-8 max-w-[1600px]">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Input Form (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Pontos Experimentais */}
              <Card
                className={`border shadow-sm transition-all ${
                  darkMode
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Pontos Experimentais
                  </CardTitle>
                  <CardDescription
                    className={darkMode ? "text-slate-400" : "text-gray-500"}
                  >
                    Dados dos traços Rico, Piloto e Pobre
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`p-4 rounded-xl border ${
                        darkMode
                          ? "bg-slate-950/50 border-slate-800"
                          : "bg-gray-50/80 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-sm font-bold uppercase tracking-wider ${
                            darkMode ? "text-emerald-400" : "text-emerald-700"
                          }`}
                        >
                          Traço {traceLabels[index]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label
                            className={`text-xs ${
                              darkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            Traço (m)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            className={`h-8 text-sm ${
                              darkMode
                                ? "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                                : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
                            }`}
                            {...register(`experimentalPoints.${index}.m`)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            className={`text-xs ${
                              darkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            a/c
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            className={`h-8 text-sm ${
                              darkMode
                                ? "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                                : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
                            }`}
                            {...register(`experimentalPoints.${index}.ac`)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            className={`text-xs ${
                              darkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            fcj (MPa)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            className={`h-8 text-sm ${
                              darkMode
                                ? "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                                : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
                            }`}
                            {...register(`experimentalPoints.${index}.fcj`)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            className={`text-xs ${
                              darkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            Dens. (kb/m³)
                          </Label>
                          <Input
                            type="number"
                            step="1"
                            className={`h-8 text-sm ${
                              darkMode
                                ? "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                                : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
                            }`}
                            {...register(`experimentalPoints.${index}.density`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Parâmetros Alvo */}
              <Card
                className={`border shadow-sm transition-all ${
                  darkMode
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Especificações do Concreto
                  </CardTitle>
                  <CardDescription
                    className={darkMode ? "text-slate-400" : "text-gray-500"}
                  >
                    Parâmetros de projeto desejados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        fck (MPa)
                      </Label>
                      <Input
                        type="number"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-white"
                        }
                        {...register("target.fck")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Desvio Padrão
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-white"
                        }
                        {...register("target.sd")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Agressividade
                      </Label>
                      <Select
                        defaultValue="2"
                        onValueChange={(v) =>
                          setValue("target.aggressivenessClass", parseInt(v))
                        }
                      >
                        <SelectTrigger
                          className={
                            darkMode
                              ? "bg-slate-800 border-slate-700 text-white"
                              : "bg-white"
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">I - Fraca</SelectItem>
                          <SelectItem value="2">II - Moderada</SelectItem>
                          <SelectItem value="3">III - Forte</SelectItem>
                          <SelectItem value="4">IV - Muito Forte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Tipo Elemento
                      </Label>
                      <Select
                        defaultValue="CA"
                        onValueChange={(v) =>
                          setValue("target.elementType", v as "CA" | "CP")
                        }
                      >
                        <SelectTrigger
                          className={
                            darkMode
                              ? "bg-slate-800 border-slate-700 text-white"
                              : "bg-white"
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">Concreto Armado</SelectItem>
                          <SelectItem value="CP">
                            Concreto Protendido
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Abatimento (mm)
                      </Label>
                      <Input
                        type="number"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-white"
                        }
                        {...register("target.slump")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Teor Argamassa (%)
                      </Label>
                      <Input
                        type="number"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-white"
                        }
                        {...register("target.mortarContent")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Container Configuration (Collapsible) */}
              <Card
                className={`border shadow-sm transition-all ${
                  darkMode
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle
                        className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        📦 Cálculo de Betonadas
                      </CardTitle>
                      <CardDescription
                        className={
                          darkMode ? "text-slate-400" : "text-gray-500"
                        }
                      >
                        Opcional: dimensões do recipiente
                      </CardDescription>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded"
                        {...register("containerConfig.enabled")}
                      />
                      <span
                        className={`text-sm ${
                          darkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        Ativar
                      </span>
                    </label>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Formato
                      </Label>
                      <Select
                        defaultValue="rectangular"
                        onValueChange={(v) =>
                          setValue(
                            "containerConfig.shape",
                            v as "rectangular" | "circular"
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            darkMode
                              ? "bg-slate-800 border-slate-700 text-white"
                              : "bg-slate-50 border-slate-300"
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rectangular">
                            Retangular
                          </SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Volume de Concreto (m³)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1.5"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-slate-50 border-slate-300"
                        }
                        {...register("containerConfig.concreteVolume")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Comprimento (cm)
                      </Label>
                      <Input
                        type="number"
                        step="1"
                        placeholder="Ex: 30"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-slate-50 border-slate-300"
                        }
                        {...register("containerConfig.lengthCm")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Largura (cm)
                      </Label>
                      <Input
                        type="number"
                        step="1"
                        placeholder="Ex: 20"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-slate-50 border-slate-300"
                        }
                        {...register("containerConfig.widthCm")}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Altura (cm)
                      </Label>
                      <Input
                        type="number"
                        step="1"
                        placeholder="Ex: 25"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-white"
                            : "bg-slate-50 border-slate-300"
                        }
                        {...register("containerConfig.heightCm")}
                      />
                      <p
                        className={`text-xs ${
                          darkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                      >
                        Volume calculado:{" "}
                        {(
                          ((defaultValues.containerConfig?.lengthCm || 30) *
                            (defaultValues.containerConfig?.widthCm || 20) *
                            (defaultValues.containerConfig?.heightCm || 25)) /
                          1000
                        ).toFixed(1)}
                        L (padiola/balde)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full text-lg py-6 font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/30"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-500/30"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Calculando...
                  </span>
                ) : (
                  "Calcular Dosagem"
                )}
              </Button>
            </form>
          </div>

          {/* RIGHT COLUMN: Results Dashboard (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {loading && !result ? (
              <div className="space-y-6 animate-pulse">
                <div
                  className={`h-64 rounded-xl ${
                    darkMode ? "bg-slate-800" : "bg-gray-200"
                  }`}
                ></div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`h-40 rounded-xl ${
                      darkMode ? "bg-slate-800" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-40 rounded-xl ${
                      darkMode ? "bg-slate-800" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
            ) : result?.success && result.data ? (
              <div
                className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                  loading
                    ? "opacity-70 pointer-events-none grayscale-[0.2]"
                    : ""
                }`}
              >
                {/* Validation Alerts */}
                {result.data.warnings.length > 0 && (
                  <Alert
                    variant="destructive"
                    className="bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700/50"
                  >
                    <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      Atenção aos Limites Normativos
                    </AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300/90">
                      <ul className="list-disc pl-5 mt-1 space-y-0.5">
                        {result.data.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Top Stats Row */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Fck Computed */}
                  <Card
                    className={`${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle
                        className={`text-sm font-medium ${
                          darkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        fcj de Dosagem
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-3xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {result.data.parameters.fcjTarget.toFixed(1)}{" "}
                        <span className="text-base font-normal text-muted-foreground">
                          MPa
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        fck{" "}
                        {result.data.parameters.fcjTarget > 30
                          ? "+ Sd"
                          : "+ margem"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Ratio a/c */}
                  <Card
                    className={`${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle
                        className={`text-sm font-medium ${
                          darkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        Relação a/c Final
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-3xl font-bold ${
                          darkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                      >
                        {result.data.parameters.targetAC.toFixed(3)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Calculado pela Lei de Abrams
                      </p>
                    </CardContent>
                  </Card>

                  {/* Traço m */}
                  <Card
                    className={`${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle
                        className={`text-sm font-medium ${
                          darkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        Traço Seco (m)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-3xl font-bold ${
                          darkMode ? "text-amber-400" : "text-amber-600"
                        }`}
                      >
                        {result.data.parameters.targetM.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Calculado pela Lei de Molinari
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Result: Traço Unitário */}
                <Card className="overflow-hidden border-0 shadow-lg relative">
                  <div
                    className={`absolute inset-0 opacity-10 bg-[url('https://grain-texture.vercel.app/grain.svg')] pointer-events-none`}
                  ></div>
                  <div className="bg-linear-to-r from-slate-800 to-slate-700 p-8 text-center relative z-10">
                    <h3 className="text-white/90 text-sm font-medium uppercase tracking-widest mb-2">
                      Traço Unitário Final (Em Massa)
                    </h3>
                    <div className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                      1 : {result.data.finalTrace.sand.toFixed(2)} :{" "}
                      {result.data.finalTrace.gravel.toFixed(2)} :{" "}
                      {result.data.finalTrace.water.toFixed(2)}
                    </div>
                    <div className="flex justify-center gap-8 text-white/70 text-sm font-medium">
                      <span>Cimento</span>
                      <span>Areia</span>
                      <span>Brita</span>
                      <span>Água</span>
                    </div>
                  </div>
                </Card>

                {/* Material Consumption Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Cimento",
                      value: result.data.consumption.cement,
                      unit: "kg/m³",
                      color: "bg-blue-500",
                    },
                    {
                      label: "Areia",
                      value: result.data.consumption.sand,
                      unit: "kg/m³",
                      color: "bg-amber-500",
                    },
                    {
                      label: "Brita",
                      value: result.data.consumption.gravel,
                      unit: "kg/m³",
                      color: "bg-gray-500",
                    },
                    {
                      label: "Água",
                      value: result.data.consumption.water,
                      unit: "L/m³",
                      color: "bg-cyan-500",
                    },
                  ].map((item) => (
                    <Card
                      key={item.label}
                      className={`${
                        darkMode
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div
                          className={`w-2 h-2 rounded-full mb-2 ${item.color}`}
                        ></div>
                        <span className="text-xs uppercase text-muted-foreground">
                          {item.label}
                        </span>
                        <span
                          className={`text-xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {Math.round(item.value)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.unit}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Batch Results (when container config provided) */}
                {result.data.batchResult && (
                  <Card
                    className={`border shadow-sm ${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle
                        className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        📦 Cálculo de Betonadas
                      </CardTitle>
                      <CardDescription
                        className={
                          darkMode ? "text-slate-400" : "text-gray-500"
                        }
                      >
                        Volume recipiente:{" "}
                        {result.data.batchResult.containerVolume.toFixed(4)} m³
                        {" • "}
                        Total: {result.data.batchResult.totalVolume} m³
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div
                          className={`p-4 rounded-lg text-center ${
                            darkMode ? "bg-slate-800" : "bg-slate-100"
                          }`}
                        >
                          <div
                            className={`text-2xl font-bold ${
                              darkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {result.data.batchResult.numberOfBatches}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            Betonadas
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg text-center ${
                            darkMode ? "bg-slate-800" : "bg-blue-50"
                          }`}
                        >
                          <div
                            className={`text-xl font-bold ${
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          >
                            {result.data.batchResult.perBatch.cement.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cimento/batch (kg)
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg text-center ${
                            darkMode ? "bg-slate-800" : "bg-amber-50"
                          }`}
                        >
                          <div
                            className={`text-xl font-bold ${
                              darkMode ? "text-amber-400" : "text-amber-600"
                            }`}
                          >
                            {result.data.batchResult.perBatch.sand.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Areia/batch (kg)
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg text-center ${
                            darkMode ? "bg-slate-800" : "bg-gray-100"
                          }`}
                        >
                          <div
                            className={`text-xl font-bold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {result.data.batchResult.perBatch.gravel.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Brita/batch (kg)
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-lg text-center ${
                            darkMode ? "bg-slate-800" : "bg-cyan-50"
                          }`}
                        >
                          <div
                            className={`text-xl font-bold ${
                              darkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                          >
                            {result.data.batchResult.perBatch.water.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Água/batch (L)
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Charts Section */}
                <div className="pt-6 border-t border-dashed border-gray-200 dark:border-slate-800">
                  <h3
                    className={`text-lg font-semibold mb-6 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Diagrama de Dosagem IPT/EPUSP
                  </h3>

                  {/* Unified IPT Diagram - Main visualization */}
                  <UnifiedIPTDiagram
                    experimentalPoints={defaultValues.experimentalPoints}
                    coefficients={result.data.coefficients}
                    parameters={result.data.parameters}
                    cementConsumption={result.data.consumption.cement}
                    darkMode={darkMode}
                  />

                  {/* Separate charts for detailed analysis */}
                  <details className="mt-6 group">
                    <summary
                      className={`cursor-pointer list-none text-sm font-medium ${
                        darkMode
                          ? "text-slate-400 hover:text-slate-300"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 transition-transform group-open:rotate-90"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        Ver gráficos individuais detalhados
                      </span>
                    </summary>
                    <div className="mt-4">
                      <DosageCharts
                        experimentalPoints={defaultValues.experimentalPoints}
                        coefficients={result.data.coefficients}
                        parameters={result.data.parameters}
                        cementConsumption={result.data.consumption.cement}
                        darkMode={darkMode}
                      />
                    </div>
                  </details>
                </div>

                {/* API Response Section */}
                <div className="pt-4">
                  <details className="group" open>
                    <summary
                      className={`cursor-pointer list-none text-sm font-medium ${
                        darkMode
                          ? "text-emerald-400 hover:text-emerald-300"
                          : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Resposta JSON da API
                        <svg
                          className="w-4 h-4 transition-transform group-open:rotate-180"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      <div
                        className={`text-xs p-3 rounded-lg flex items-center justify-between ${
                          darkMode
                            ? "bg-slate-800 text-slate-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span>Endpoint:</span>
                        <code className="font-mono text-emerald-500">
                          POST /api/v1/dosage
                        </code>
                      </div>
                      <pre className="text-xs font-mono overflow-auto max-h-[400px] p-4 rounded-lg bg-black/90 text-emerald-400 border border-emerald-900/50">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                      >
                        <a
                          href="https://github.com/fcfim/Concrete-Mix-Design-IPT-Method/wiki"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-500 underline"
                        >
                          Documentação da API
                        </a>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ) : result?.error ? (
              <Alert
                variant="destructive"
                className="bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800"
              >
                <AlertTitle className="text-red-700 dark:text-red-400 font-bold">
                  Erro no Cálculo
                </AlertTitle>
                <AlertDescription className="text-red-600 dark:text-red-300">
                  {result.error.message}
                  {result.error.details && (
                    <div className="mt-2 text-xs bg-red-100 dark:bg-red-950 p-2 rounded">
                      {result.error.details.map(
                        (d: { path: string[]; message: string }, i: number) => (
                          <div key={i}>
                            {d.path?.join(".")} : {d.message}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              // Empty State
              <div
                className={`h-full flex flex-col items-center justify-center min-h-[500px] rounded-3xl border-2 border-dashed ${
                  darkMode
                    ? "border-slate-800 bg-slate-900/30 text-slate-500"
                    : "border-gray-200 bg-gray-50/50 text-gray-400"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    darkMode ? "bg-slate-800" : "bg-white"
                  }`}
                >
                  <ConcreteIcon />
                </div>
                <h3
                  className={`text-xl font-medium mb-2 ${
                    darkMode ? "text-slate-300" : "text-gray-500"
                  }`}
                >
                  Aguardando Dados
                </h3>
                <p className="max-w-md text-center text-sm opacity-80">
                  Preencha o formulário à esquerda com os dados experimentais e
                  especificações do projeto para gerar o traço.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`text-center py-8 border-t mt-auto ${
          darkMode
            ? "border-slate-800 text-slate-500"
            : "border-gray-200 text-gray-500"
        }`}
      >
        <p className="text-sm">
          Método IPT/EPUSP •{" "}
          <a
            href="https://www.abntcatalogo.com.br/pnm.aspx?Q=RE1UZ3RFQjFnVHYxMmlPcHZVSk8xb2FzVEF4cXp5aUxPakkvSlR5MEI0ST0="
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:underline"
          >
            NBR 6118:2023
          </a>{" "}
          •{" "}
          <a
            href="https://www.abntcatalogo.com.br/pnm.aspx?Q=TC9DaUdyZTRhRTRzN2JBditWM0VCZjJqVHpKdmUrYXdFYmViRU51RWhnWT0="
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:underline"
          >
            NBR 12655:2022
          </a>
        </p>
        <p className="mt-2 text-sm">
          API Endpoint:{" "}
          <code className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
            POST /api/v1/dosage
          </code>
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a
            href="https://github.com/fcfim/Concrete-Mix-Design-IPT-Method"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-sm hover:text-emerald-500 transition-colors`}
          >
            <GitHubIcon /> Repositório
          </a>
          <span className={darkMode ? "text-slate-700" : "text-gray-300"}>
            |
          </span>
          <a
            href="https://github.com/fcfim/Concrete-Mix-Design-IPT-Method/wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-emerald-500 transition-colors"
          >
            Documentação
          </a>
          <span className={darkMode ? "text-slate-700" : "text-gray-300"}>
            |
          </span>
          <a
            href="https://github.com/fcfim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-emerald-500 transition-colors"
          >
            Criado por @fcfim
          </a>
        </div>
      </footer>
    </div>
  );
}
