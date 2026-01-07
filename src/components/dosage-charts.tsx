"use client";

/**
 * Componente de Gráficos do Diagrama de Dosagem IPT
 *
 * Exibe os 3 gráficos característicos do método IPT/EPUSP:
 * 1. Lei de Abrams: fcj vs a/c (exponencial)
 * 2. Lei de Lyse: m vs a/c (linear)
 * 3. Lei de Molinari: C vs m (hiperbólica)
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExperimentalPoint {
  m: number;
  ac: number;
  fcj: number;
}

interface Coefficients {
  abrams: { k1: number; k2: number; r2: number };
  lyse: { k3: number; k4: number; r2: number };
  molinari: { k5: number; k6: number; r2: number };
}

interface TargetParameters {
  fcjTarget: number;
  targetAC: number;
  targetM: number;
}

interface DosageChartsProps {
  experimentalPoints: ExperimentalPoint[];
  coefficients: Coefficients;
  parameters: TargetParameters;
  cementConsumption: number;
  darkMode: boolean;
}

// Gera pontos para a curva suave
function generateCurvePoints(
  law: "abrams" | "lyse" | "molinari",
  coeffs: Coefficients,
  range: { min: number; max: number; step: number }
) {
  const points = [];
  for (let x = range.min; x <= range.max; x += range.step) {
    let y: number;
    switch (law) {
      case "abrams":
        // fcj = k1 / k2^(a/c)
        y = coeffs.abrams.k1 / Math.pow(coeffs.abrams.k2, x);
        break;
      case "lyse":
        // m = k3 + k4 * (a/c)
        y = coeffs.lyse.k3 + coeffs.lyse.k4 * x;
        break;
      case "molinari":
        // C = 1000 / (k5 + k6 * m)
        y = 1000 / (coeffs.molinari.k5 + coeffs.molinari.k6 * x);
        break;
    }
    points.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(2)) });
  }
  return points;
}

export default function DosageCharts({
  experimentalPoints,
  coefficients,
  parameters,
  cementConsumption,
  darkMode,
}: DosageChartsProps) {
  // Cores do tema
  const colors = {
    grid: darkMode ? "#374151" : "#e5e7eb",
    text: darkMode ? "#9ca3af" : "#6b7280",
    axis: darkMode ? "#e5e7eb" : "#374151",
    curve: "#10b981", // emerald-500
    point: "#f59e0b", // amber-500
    target: "#ef4444", // red-500
    cardBg: darkMode
      ? "bg-slate-800 border-slate-700"
      : "bg-white border-gray-200",
    cardTitle: darkMode ? "text-white" : "text-gray-900",
  };

  // Dados para gráfico de Abrams (fcj vs a/c)
  const abramsExperimental = experimentalPoints.map((p) => ({
    ac: p.ac,
    fcj: p.fcj,
  }));
  const abramsCurve = generateCurvePoints("abrams", coefficients, {
    min: 0.35,
    max: 0.85,
    step: 0.01,
  });

  // Dados para gráfico de Lyse (m vs a/c)
  const lyseExperimental = experimentalPoints.map((p) => ({
    ac: p.ac,
    m: p.m,
  }));
  const lyseCurve = generateCurvePoints("lyse", coefficients, {
    min: 0.35,
    max: 0.85,
    step: 0.01,
  });

  // Dados para gráfico de Molinari (C vs m)
  const molinariExperimental = experimentalPoints.map((p) => ({
    m: p.m,
    // Estimar C a partir dos dados experimentais
    C: 1000 / (coefficients.molinari.k5 + coefficients.molinari.k6 * p.m),
  }));
  const molinariCurve = generateCurvePoints("molinari", coefficients, {
    min: 2.5,
    max: 8,
    step: 0.1,
  });

  const tooltipStyle = {
    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
    border: `1px solid ${darkMode ? "#475569" : "#e5e7eb"}`,
    color: darkMode ? "#e2e8f0" : "#1f2937",
    borderRadius: "8px",
    padding: "8px 12px",
  };

  return (
    <div className="space-y-6">
      {/* Gráfico 1: Lei de Abrams */}
      <Card className={colors.cardBg}>
        <CardHeader>
          <CardTitle className={colors.cardTitle}>Lei de Abrams</CardTitle>
          <CardDescription
            className={darkMode ? "text-slate-400" : "text-gray-500"}
          >
            Resistência (fcj) × Relação água/cimento (a/c)
            <span className="block text-xs mt-1 font-mono">
              fcj = {coefficients.abrams.k1.toFixed(2)} /{" "}
              {coefficients.abrams.k2.toFixed(3)}^(a/c) | R² ={" "}
              {coefficients.abrams.r2.toFixed(4)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0.35, 0.85]}
                  tickFormatter={(v) => v.toFixed(2)}
                  label={{
                    value: "a/c",
                    position: "bottom",
                    fill: colors.text,
                  }}
                  stroke={colors.axis}
                  tick={{ fill: colors.text }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={["auto", "auto"]}
                  label={{
                    value: "fcj (MPa)",
                    angle: -90,
                    position: "insideLeft",
                    fill: colors.text,
                  }}
                  stroke={colors.axis}
                  tick={{ fill: colors.text }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(v) => `a/c = ${v}`}
                  formatter={(v) => [`${Number(v ?? 0).toFixed(1)} MPa`, "fcj"]}
                />
                <Legend />
                {/* Curva ajustada */}
                <Line
                  data={abramsCurve}
                  dataKey="y"
                  stroke={colors.curve}
                  strokeWidth={2}
                  dot={false}
                  name="Curva de Abrams"
                />
                {/* Pontos experimentais */}
                {abramsExperimental.map((point, i) => (
                  <ReferenceDot
                    key={i}
                    x={point.ac}
                    y={point.fcj}
                    r={6}
                    fill={colors.point}
                    stroke={darkMode ? "#1e293b" : "#ffffff"}
                    strokeWidth={2}
                  />
                ))}
                {/* Ponto alvo */}
                <ReferenceDot
                  x={parameters.targetAC}
                  y={parameters.fcjTarget}
                  r={8}
                  fill={colors.target}
                  stroke={darkMode ? "#1e293b" : "#ffffff"}
                  strokeWidth={2}
                />
                {/* Linha de referência horizontal */}
                <ReferenceLine
                  y={parameters.fcjTarget}
                  stroke={colors.target}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                {/* Linha de referência vertical */}
                <ReferenceLine
                  x={parameters.targetAC}
                  stroke={colors.target}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.point }}
              />
              <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                Experimental
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.target }}
              />
              <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                Alvo (fcj={parameters.fcjTarget} MPa)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 2: Lei de Lyse */}
      <Card className={colors.cardBg}>
        <CardHeader>
          <CardTitle className={colors.cardTitle}>Lei de Lyse</CardTitle>
          <CardDescription
            className={darkMode ? "text-slate-400" : "text-gray-500"}
          >
            Traço seco (m) × Relação água/cimento (a/c)
            <span className="block text-xs mt-1 font-mono">
              m = {coefficients.lyse.k3.toFixed(2)} +{" "}
              {coefficients.lyse.k4.toFixed(2)} × (a/c) | R² ={" "}
              {coefficients.lyse.r2.toFixed(4)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0.35, 0.85]}
                  tickFormatter={(v) => v.toFixed(2)}
                  label={{
                    value: "a/c",
                    position: "bottom",
                    fill: colors.text,
                  }}
                  stroke={colors.axis}
                  tick={{ fill: colors.text }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={["auto", "auto"]}
                  label={{
                    value: "m",
                    angle: -90,
                    position: "insideLeft",
                    fill: colors.text,
                  }}
                  stroke={colors.axis}
                  tick={{ fill: colors.text }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(v) => `a/c = ${v}`}
                  formatter={(v) => [Number(v ?? 0).toFixed(2), "m"]}
                />
                <Legend />
                {/* Curva ajustada */}
                <Line
                  data={lyseCurve}
                  dataKey="y"
                  stroke={colors.curve}
                  strokeWidth={2}
                  dot={false}
                  name="Curva de Lyse"
                />
                {/* Pontos experimentais */}
                {lyseExperimental.map((point, i) => (
                  <ReferenceDot
                    key={i}
                    x={point.ac}
                    y={point.m}
                    r={6}
                    fill={colors.point}
                    stroke={darkMode ? "#1e293b" : "#ffffff"}
                    strokeWidth={2}
                  />
                ))}
                {/* Ponto alvo */}
                <ReferenceDot
                  x={parameters.targetAC}
                  y={parameters.targetM}
                  r={8}
                  fill={colors.target}
                  stroke={darkMode ? "#1e293b" : "#ffffff"}
                  strokeWidth={2}
                />
                {/* Linhas de referência */}
                <ReferenceLine
                  y={parameters.targetM}
                  stroke={colors.target}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                <ReferenceLine
                  x={parameters.targetAC}
                  stroke={colors.target}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.point }}
              />
              <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                Experimental
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.target }}
              />
              <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                Alvo (m={parameters.targetM.toFixed(2)})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 3: Lei de Molinari */}
      <Card className={colors.cardBg}>
        <CardHeader>
          <CardTitle className={colors.cardTitle}>Lei de Molinari</CardTitle>
          <CardDescription
            className={darkMode ? "text-slate-400" : "text-gray-500"}
          >
            Consumo de cimento (C) × Traço seco (m)
            <span className="block text-xs mt-1 font-mono">
              C = 1000 / ({coefficients.molinari.k5.toFixed(4)} +{" "}
              {coefficients.molinari.k6.toFixed(4)} × m) | R² ={" "}
              {coefficients.molinari.r2.toFixed(4)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[2.5, 8]}
                  tickFormatter={(v) => v.toFixed(1)}
                  label={{ value: "m", position: "bottom", fill: colors.text }}
                  stroke={colors.axis}
                  tick={{ fill: colors.text }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={["auto", "auto"]}
                  label={{
                    value: "C (kg/m³)",
                    angle: -90,
                    position: "insideLeft",
                    fill: colors.text,
                  }}
                  stroke={colors.axis}
                  tick={{ fill: colors.text }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(v) => `m = ${v}`}
                  formatter={(v) => [`${Number(v ?? 0).toFixed(0)} kg/m³`, "C"]}
                />
                <Legend />
                {/* Curva ajustada */}
                <Line
                  data={molinariCurve}
                  dataKey="y"
                  stroke={colors.curve}
                  strokeWidth={2}
                  dot={false}
                  name="Curva de Molinari"
                />
                {/* Pontos experimentais (estimados) */}
                {molinariExperimental.map((point, i) => (
                  <ReferenceDot
                    key={i}
                    x={point.m}
                    y={point.C}
                    r={6}
                    fill={colors.point}
                    stroke={darkMode ? "#1e293b" : "#ffffff"}
                    strokeWidth={2}
                  />
                ))}
                {/* Ponto alvo */}
                <ReferenceDot
                  x={parameters.targetM}
                  y={cementConsumption}
                  r={8}
                  fill={colors.target}
                  stroke={darkMode ? "#1e293b" : "#ffffff"}
                  strokeWidth={2}
                />
                {/* Linhas de referência */}
                <ReferenceLine
                  y={cementConsumption}
                  stroke={colors.target}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                <ReferenceLine
                  x={parameters.targetM}
                  stroke={colors.target}
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.point }}
              />
              <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                Experimental
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.target }}
              />
              <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
                Alvo (C={Math.round(cementConsumption)} kg/m³)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
