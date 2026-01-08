"use client";

/**
 * Playground de Dosagem IPT/EPUSP
 *
 * Interface interativa para testar a API de dosagem de concreto.
 * Permite inserir dados experimentais e verificar resultados em tempo real.
 */

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import DosageCharts from "@/components/dosage-charts";

// Icons (inline SVGs)
const SunIcon = () => (
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
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
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
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const ConcreteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13.791 8.531c9.642 1.561 23.859 12.716 11.405 32.97" />
    <path d="M16.348 41.5c4.567-4.404 7.22-8.721 7.22-14.223c0-6.62-3.385-12.257-10.89-12.257c-4.95 0-7.178 2.557-7.178 5.736c0 4.26 3.425 5.473 5.538 5.473c3.048 0 4.064-3.016 4.064-3.016M32.8 41.5c4.456-11.339 6.967-21.015-6.162-35m13.109 35c4.14-12.06 3.411-21.046-.852-29.101" />
  </svg>
);

// Schema de validação do formulário
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
});

// FormData type (explicit definition for Zod v4 compatibility)
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
}

// Valores padrão para o formulário
const defaultValues: FormData = {
  experimentalPoints: [
    { m: 3.5, ac: 0.45, fcj: 42, density: 2350 },
    { m: 5.0, ac: 0.58, fcj: 32, density: 2300 },
    { m: 6.5, ac: 0.72, fcj: 22, density: 2250 },
  ],
  target: {
    fck: 30,
    sd: 5.5,
    aggressivenessClass: 2,
    elementType: "CA",
    slump: 100,
    mortarContent: 52,
  },
};

interface ApiResult {
  success: boolean;
  meta?: {
    method: string;
    version: string;
    timestamp: string;
  };
  data?: {
    finalTrace: { cement: number; sand: number; gravel: number; water: number };
    consumption: {
      cement: number;
      sand: number;
      gravel: number;
      water: number;
    };
    parameters: { fcjTarget: number; targetAC: number; targetM: number };
    coefficients: {
      abrams: { k1: number; k2: number; r2: number };
      lyse: { k3: number; k4: number; r2: number };
      molinari: { k5: number; k6: number; r2: number };
    };
    warnings: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: { path: string[]; message: string }[];
  };
}

export default function PlaygroundPage() {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const { register, control, handleSubmit, setValue } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  const { fields } = useFieldArray({
    control,
    name: "experimentalPoints",
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);

    try {
      // Transform data to ensure all numeric fields are numbers (not strings)
      const transformedData = {
        experimentalPoints: data.experimentalPoints.map((point) => ({
          m: Number(point.m),
          ac: Number(point.ac),
          fcj: Number(point.fcj),
          density: Number(point.density),
        })),
        target: {
          fck: Number(data.target.fck),
          sd: Number(data.target.sd),
          aggressivenessClass: Number(data.target.aggressivenessClass),
          elementType: data.target.elementType,
          slump: Number(data.target.slump),
          mortarContent: Number(data.target.mortarContent),
        },
      };

      const response = await fetch("/api/v1/dosage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });

      const json: ApiResult = await response.json();
      setResult(json);
      setActiveTab("results");
    } catch {
      setResult({
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Erro de conexão com a API",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const traceLabels = ["Rico", "Piloto", "Pobre"];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b ${
          darkMode
            ? "border-slate-700 bg-slate-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                darkMode ? "bg-emerald-600" : "bg-emerald-500"
              }`}
            >
              <ConcreteIcon />
            </div>
            <div>
              <h1
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dosagem IPT/EPUSP
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                API de Dosagem de Concreto
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
                    ? "hover:bg-slate-700 text-slate-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="Repositório GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://github.com/fcfim"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-slate-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="GitHub do Criador"
              >
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
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/filipefim"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-slate-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={darkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList
            className={`grid w-full grid-cols-4 ${
              darkMode ? "bg-slate-800" : "bg-gray-100"
            }`}
          >
            <TabsTrigger
              value="form"
              className={`data-[state=active]:bg-emerald-500 data-[state=active]:text-white ${
                darkMode ? "" : "data-[state=inactive]:text-gray-600"
              }`}
            >
              Dados de Entrada
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className={`data-[state=active]:bg-emerald-500 data-[state=active]:text-white ${
                darkMode ? "" : "data-[state=inactive]:text-gray-600"
              }`}
            >
              Resultados
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className={`data-[state=active]:bg-emerald-500 data-[state=active]:text-white ${
                darkMode ? "" : "data-[state=inactive]:text-gray-600"
              }`}
            >
              Gráficos
            </TabsTrigger>
            <TabsTrigger
              value="json"
              className={`data-[state=active]:bg-emerald-500 data-[state=active]:text-white ${
                darkMode ? "" : "data-[state=inactive]:text-gray-600"
              }`}
            >
              JSON
            </TabsTrigger>
          </TabsList>

          {/* Tab: Formulário */}
          <TabsContent value="form">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Pontos Experimentais */}
              <Card
                className={
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }
              >
                <CardHeader>
                  <CardTitle
                    className={darkMode ? "text-white" : "text-gray-900"}
                  >
                    Pontos Experimentais
                  </CardTitle>
                  <CardDescription
                    className={darkMode ? "text-slate-400" : "text-gray-500"}
                  >
                    Insira os dados de 3 traços experimentais (Rico, Piloto,
                    Pobre)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {fields.map((field, index) => (
                      <Card
                        key={field.id}
                        className={
                          darkMode
                            ? "bg-slate-900 border-slate-600"
                            : "bg-gray-50 border-gray-200"
                        }
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle
                            className={`text-lg ${
                              darkMode ? "text-emerald-400" : "text-emerald-600"
                            }`}
                          >
                            Traço {traceLabels[index]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-3">
                          <div>
                            <Label
                              className={
                                darkMode ? "text-slate-300" : "text-gray-700"
                              }
                            >
                              Traço (m)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              className={
                                darkMode
                                  ? "bg-slate-800 border-slate-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }
                              {...register(`experimentalPoints.${index}.m`)}
                            />
                          </div>
                          <div>
                            <Label
                              className={
                                darkMode ? "text-slate-300" : "text-gray-700"
                              }
                            >
                              Relação a/c
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              className={
                                darkMode
                                  ? "bg-slate-800 border-slate-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }
                              {...register(`experimentalPoints.${index}.ac`)}
                            />
                          </div>
                          <div>
                            <Label
                              className={
                                darkMode ? "text-slate-300" : "text-gray-700"
                              }
                            >
                              fcj (MPa)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              className={
                                darkMode
                                  ? "bg-slate-800 border-slate-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }
                              {...register(`experimentalPoints.${index}.fcj`)}
                            />
                          </div>
                          <div>
                            <Label
                              className={
                                darkMode ? "text-slate-300" : "text-gray-700"
                              }
                            >
                              Densidade (kg/m³)
                            </Label>
                            <Input
                              type="number"
                              step="1"
                              className={
                                darkMode
                                  ? "bg-slate-800 border-slate-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }
                              {...register(
                                `experimentalPoints.${index}.density`
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Parâmetros Alvo */}
              <Card
                className={
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }
              >
                <CardHeader>
                  <CardTitle
                    className={darkMode ? "text-white" : "text-gray-900"}
                  >
                    Parâmetros do Concreto Desejado
                  </CardTitle>
                  <CardDescription
                    className={darkMode ? "text-slate-400" : "text-gray-500"}
                  >
                    Defina as características do concreto a ser dosado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
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
                            ? "bg-slate-800 border-slate-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }
                        {...register("target.fck")}
                      />
                    </div>
                    <div>
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Desvio Padrão (MPa)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }
                        {...register("target.sd")}
                      />
                    </div>
                    <div>
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Classe de Agressividade
                      </Label>
                      <Select
                        defaultValue="2"
                        onValueChange={(v) =>
                          setValue(
                            "target.aggressivenessClass",
                            parseInt(v) as 1 | 2 | 3 | 4
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            darkMode
                              ? "bg-slate-800 border-slate-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
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
                    <div>
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Tipo de Elemento
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
                              ? "bg-slate-800 border-slate-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
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
                    <div>
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
                            ? "bg-slate-800 border-slate-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }
                        {...register("target.slump")}
                      />
                    </div>
                    <div>
                      <Label
                        className={
                          darkMode ? "text-slate-300" : "text-gray-700"
                        }
                      >
                        Teor de Argamassa (%)
                      </Label>
                      <Input
                        type="number"
                        className={
                          darkMode
                            ? "bg-slate-800 border-slate-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }
                        {...register("target.mortarContent")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-6"
              >
                {loading ? "Calculando..." : "Calcular Dosagem"}
              </Button>
            </form>
          </TabsContent>

          {/* Tab: Resultados */}
          <TabsContent value="results">
            {loading ? (
              <Card
                className={
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }
              >
                <CardContent className="p-6 space-y-4">
                  <Skeleton
                    className={`h-8 w-1/3 ${
                      darkMode ? "bg-slate-700" : "bg-gray-200"
                    }`}
                  />
                  <Skeleton
                    className={`h-24 w-full ${
                      darkMode ? "bg-slate-700" : "bg-gray-200"
                    }`}
                  />
                  <Skeleton
                    className={`h-24 w-full ${
                      darkMode ? "bg-slate-700" : "bg-gray-200"
                    }`}
                  />
                </CardContent>
              </Card>
            ) : result?.success && result.data ? (
              <div className="space-y-6">
                {/* Warnings */}
                {result.data.warnings.length > 0 && (
                  <Alert
                    variant="destructive"
                    className="bg-amber-50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-600"
                  >
                    <AlertTitle className="text-amber-700 dark:text-amber-400">
                      Avisos Normativos
                    </AlertTitle>
                    <AlertDescription className="text-amber-600 dark:text-amber-200">
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        {result.data.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Traço Unitário */}
                <Card className="bg-linear-to-br from-emerald-500 to-teal-600 border-0">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Traço Unitário Final
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-white text-center py-4">
                      1 : {result.data.finalTrace.sand.toFixed(2)} :{" "}
                      {result.data.finalTrace.gravel.toFixed(2)} :{" "}
                      {result.data.finalTrace.water.toFixed(2)}
                    </div>
                    <div className="text-center text-white/80 text-sm">
                      Cimento : Areia : Brita : Água
                    </div>
                  </CardContent>
                </Card>

                {/* Consumos */}
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    {
                      label: "Cimento",
                      value: result.data.consumption.cement,
                      unit: "kg/m³",
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      label: "Areia",
                      value: result.data.consumption.sand,
                      unit: "kg/m³",
                      color: "from-amber-500 to-amber-600",
                    },
                    {
                      label: "Brita",
                      value: result.data.consumption.gravel,
                      unit: "kg/m³",
                      color: "from-gray-500 to-gray-600",
                    },
                    {
                      label: "Água",
                      value: result.data.consumption.water,
                      unit: "L/m³",
                      color: "from-cyan-500 to-cyan-600",
                    },
                  ].map((item) => (
                    <Card
                      key={item.label}
                      className={`bg-linear-to-br ${item.color} border-0`}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-white/80">{item.label}</p>
                        <p className="text-3xl font-bold text-white">
                          {Math.round(item.value)}
                        </p>
                        <p className="text-xs text-white/60">{item.unit}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Parâmetros Calculados */}
                <Card
                  className={
                    darkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-200"
                  }
                >
                  <CardHeader>
                    <CardTitle
                      className={darkMode ? "text-white" : "text-gray-900"}
                    >
                      Parâmetros Calculados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-slate-900" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            darkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          fcj (Dosagem)
                        </p>
                        <p className="text-2xl font-bold text-emerald-500">
                          {result.data.parameters.fcjTarget} MPa
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-slate-900" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            darkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          a/c Final
                        </p>
                        <p className="text-2xl font-bold text-cyan-500">
                          {result.data.parameters.targetAC.toFixed(3)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-slate-900" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            darkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Traço (m)
                        </p>
                        <p className="text-2xl font-bold text-amber-500">
                          {result.data.parameters.targetM.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Coeficientes */}
                <Card
                  className={
                    darkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-200"
                  }
                >
                  <CardHeader>
                    <CardTitle
                      className={darkMode ? "text-white" : "text-gray-900"}
                    >
                      Coeficientes das Curvas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-slate-900" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Lei de Abrams
                        </p>
                        <p
                          className={
                            darkMode ? "text-slate-200" : "text-gray-700"
                          }
                        >
                          k1 = {result.data.coefficients.abrams.k1.toFixed(2)}
                        </p>
                        <p
                          className={
                            darkMode ? "text-slate-200" : "text-gray-700"
                          }
                        >
                          k2 = {result.data.coefficients.abrams.k2.toFixed(3)}
                        </p>
                        <p className="text-emerald-500 text-sm">
                          R² = {result.data.coefficients.abrams.r2.toFixed(4)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-slate-900" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Lei de Lyse
                        </p>
                        <p
                          className={
                            darkMode ? "text-slate-200" : "text-gray-700"
                          }
                        >
                          k3 = {result.data.coefficients.lyse.k3.toFixed(2)}
                        </p>
                        <p
                          className={
                            darkMode ? "text-slate-200" : "text-gray-700"
                          }
                        >
                          k4 = {result.data.coefficients.lyse.k4.toFixed(2)}
                        </p>
                        <p className="text-emerald-500 text-sm">
                          R² = {result.data.coefficients.lyse.r2.toFixed(4)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode ? "bg-slate-900" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Lei de Molinari
                        </p>
                        <p
                          className={
                            darkMode ? "text-slate-200" : "text-gray-700"
                          }
                        >
                          k5 = {result.data.coefficients.molinari.k5.toFixed(4)}
                        </p>
                        <p
                          className={
                            darkMode ? "text-slate-200" : "text-gray-700"
                          }
                        >
                          k6 = {result.data.coefficients.molinari.k6.toFixed(4)}
                        </p>
                        <p className="text-emerald-500 text-sm">
                          R² = {result.data.coefficients.molinari.r2.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : result?.error ? (
              <Alert
                variant="destructive"
                className="bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-600"
              >
                <AlertTitle className="text-red-700 dark:text-red-400">
                  Erro: {result.error.code}
                </AlertTitle>
                <AlertDescription className="text-red-600 dark:text-red-200">
                  {result.error.message}
                  {result.error.details && (
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      {result.error.details.map((d, i) => (
                        <li key={i}>
                          {d.path.join(".")}: {d.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Card
                className={
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }
              >
                <CardContent
                  className={`p-12 text-center ${
                    darkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  <p className="text-lg">
                    Preencha os dados e clique em &quot;Calcular Dosagem&quot;
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="charts">
            {result?.success && result.data ? (
              <DosageCharts
                experimentalPoints={defaultValues.experimentalPoints}
                coefficients={result.data.coefficients}
                parameters={result.data.parameters}
                cementConsumption={result.data.consumption.cement}
                darkMode={darkMode}
              />
            ) : (
              <Card
                className={
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }
              >
                <CardContent
                  className={`p-12 text-center ${
                    darkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  <p className="text-lg">
                    Execute um cálculo para visualizar os gráficos
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: JSON */}
          <TabsContent value="json">
            <Card
              className={
                darkMode
                  ? "bg-slate-900 border-slate-700"
                  : "bg-gray-900 border-gray-700"
              }
            >
              <CardHeader>
                <CardTitle className="text-white">
                  Resposta JSON da API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-emerald-400 overflow-auto max-h-[600px] p-4 bg-black/30 rounded-lg">
                  {result
                    ? JSON.stringify(result, null, 2)
                    : "Nenhum resultado ainda"}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer
          className={`text-center mt-12 pt-8 border-t ${
            darkMode
              ? "border-slate-700 text-slate-500"
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
              className={`flex items-center gap-2 text-sm hover:text-emerald-500 transition-colors ${
                darkMode ? "text-slate-400" : "text-gray-600"
              }`}
            >
              <GitHubIcon /> Repositório
            </a>
            <span className={darkMode ? "text-slate-600" : "text-gray-300"}>
              |
            </span>
            <a
              href="https://github.com/fcfim"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm hover:text-emerald-500 transition-colors ${
                darkMode ? "text-slate-400" : "text-gray-600"
              }`}
            >
              Criado por @fcfim
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
