"use client";

/**
 * Diagrama Unificado de Dosagem IPT/EPUSP
 *
 * Layout dos 4 Quadrantes (da esquerda para direita):
 * - Q1 (Superior Esquerdo): VAZIO - apenas eixo C e setas de fluxo
 * - Q2 (Superior Direito): Lei de ABRAMS (fc × a/c)
 * - Q3 (Inferior Esquerdo): Lei de MOLINARI (C × m)
 * - Q4 (Inferior Direito): Lei de LYSE (m × a/c)
 *
 * Fluxo de extração:
 * 1. Entra com fcj alvo → intercepta Abrams → obtém a/c
 * 2. Desce vertical → intercepta Lyse → obtém m
 * 3. Vai horizontal esquerda → intercepta Molinari → obtém C
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  content: string;
  type: "experimental" | "target";
}

interface ExperimentalPoint {
  m: number;
  ac: number;
  fcj: number;
  density?: number;
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

interface UnifiedIPTDiagramProps {
  experimentalPoints: ExperimentalPoint[];
  coefficients: Coefficients;
  parameters: TargetParameters;
  cementConsumption: number;
  darkMode: boolean;
}

export default function UnifiedIPTDiagram({
  experimentalPoints,
  coefficients,
  parameters,
  cementConsumption,
  darkMode,
}: UnifiedIPTDiagramProps) {
  // Estado do tooltip para interatividade
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    content: "",
    type: "experimental",
  });

  // Dimensões do diagrama
  const width = 900;
  const height = 750;
  const margin = { top: 60, right: 60, bottom: 80, left: 80 };

  // Centro do diagrama (onde os eixos se cruzam)
  const centerX = width / 2;
  const centerY = margin.top + (height - margin.top - margin.bottom) * 0.42;

  // Larguras e alturas de cada região
  const rightWidth = width - centerX - margin.right;
  const leftWidth = centerX - margin.left;
  const topHeight = centerY - margin.top;
  const bottomHeight = height - centerY - margin.bottom;

  // Escalas dos eixos
  const acMin = 0.3,
    acMax = 0.9; // a/c (Q2, Q4 - eixo X direito)
  const fcMin = 10,
    fcMax = 70; // fc MPa (Q2 - eixo Y superior)
  const mMin = 2,
    mMax = 12; // m (Q3, Q4 - cresce para baixo!)
  const cMin = 150,
    cMax = 600; // C kg/m³ (Q1, Q3 - eixo Y esquerdo)

  // Funções de mapeamento de coordenadas

  // Q2 & Q4: a/c para X (direita do centro)
  const acToX = (ac: number) =>
    centerX + ((ac - acMin) / (acMax - acMin)) * rightWidth;

  // Q2: fc para Y (acima do centro, cresce para cima)
  const fcToY = (fc: number) =>
    margin.top + ((fcMax - fc) / (fcMax - fcMin)) * topHeight;

  // Q4 & Q3: m para Y (abaixo do centro, CRESCE PARA BAIXO!)
  const mToY = (m: number) =>
    centerY + ((m - mMin) / (mMax - mMin)) * bottomHeight;

  // Q3: m para X (esquerda do centro, cresce para esquerda)
  const mToXLeft = (m: number) =>
    centerX - ((m - mMin) / (mMax - mMin)) * leftWidth;

  // Q3: C para X (esquerda do centro, C alto mais à esquerda)
  const cToXLeft = (c: number) =>
    margin.left + ((cMax - c) / (cMax - cMin)) * leftWidth;

  // Cores do tema
  const colors = {
    grid: darkMode ? "#374151" : "#d1d5db",
    axis: darkMode ? "#e5e7eb" : "#1f2937",
    text: darkMode ? "#9ca3af" : "#6b7280",
    abrams: "#10b981", // emerald-500 (curva principal)
    lyse: "#10b981", // emerald-500
    molinari: "#10b981", // emerald-500 (igual Abrams/Lyse)
    target: "#ef4444", // red-500 (linhas de referência)
    targetDot: "#ef4444", // red-500
    experimental: "#f59e0b", // amber-500
    cardBg: darkMode
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-gray-200",
  };

  // Geração das curvas
  const generateAbramsCurve = () => {
    const points: { x: number; y: number; ac: number; fc: number }[] = [];
    for (let ac = acMin; ac <= acMax; ac += 0.01) {
      const fc = coefficients.abrams.k1 / Math.pow(coefficients.abrams.k2, ac);
      if (fc >= fcMin && fc <= fcMax) {
        points.push({ x: acToX(ac), y: fcToY(fc), ac, fc });
      }
    }
    return points;
  };

  const generateLyseCurve = () => {
    const points: { x: number; y: number; ac: number; m: number }[] = [];
    for (let ac = acMin; ac <= acMax; ac += 0.01) {
      const m = coefficients.lyse.k3 + coefficients.lyse.k4 * ac;
      if (m >= mMin && m <= mMax) {
        points.push({ x: acToX(ac), y: mToY(m), ac, m });
      }
    }
    return points;
  };

  const generateMolinariCurve = () => {
    const points: { x: number; y: number; m: number; c: number }[] = [];
    for (let m = mMin; m <= mMax; m += 0.1) {
      const c =
        1000 / (coefficients.molinari.k5 + coefficients.molinari.k6 * m);
      if (c >= cMin && c <= cMax) {
        points.push({ x: cToXLeft(c), y: mToY(m), m, c });
      }
    }
    return points;
  };

  // Converter pontos para path SVG
  const pointsToPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return points
      .map(
        (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
      )
      .join(" ");
  };

  const abramsCurve = generateAbramsCurve();
  const lyseCurve = generateLyseCurve();
  const molinariCurve = generateMolinariCurve();

  // Pontos alvo calculados
  const targetAcX = acToX(parameters.targetAC);
  const targetFcY = fcToY(parameters.fcjTarget);
  const targetMY = mToY(parameters.targetM);
  const targetCX = cToXLeft(cementConsumption);

  // Marcações de ticks
  const acTicks = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const fcTicks = [20, 30, 40, 50, 60];
  const mTicks = [3, 6, 9, 12];
  const cTicks = [200, 300, 400, 500, 600];

  return (
    <Card className={colors.cardBg}>
      <CardHeader className="pb-2">
        <CardTitle className={darkMode ? "text-white" : "text-gray-900"}>
          Diagrama de Dosagem IPT/EPUSP
        </CardTitle>
        <p
          className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}
        >
          Gráfico unificado das 3 leis de dosagem
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center overflow-x-auto">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="max-w-full h-auto"
          >
            {/* Background */}
            <rect
              width={width}
              height={height}
              fill={darkMode ? "#0f172a" : "#ffffff"}
            />

            {/* ========== GRID LINES ========== */}

            {/* Q2: Grid vertical (a/c) - superior direito */}
            {acTicks.map((ac) => (
              <line
                key={`grid-ac-top-${ac}`}
                x1={acToX(ac)}
                y1={margin.top}
                x2={acToX(ac)}
                y2={centerY}
                stroke={colors.grid}
                strokeDasharray="2 2"
                strokeWidth={0.5}
              />
            ))}
            {/* Q2: Grid horizontal (fc) - superior direito */}
            {fcTicks.map((fc) => (
              <line
                key={`grid-fc-${fc}`}
                x1={centerX}
                y1={fcToY(fc)}
                x2={width - margin.right}
                y2={fcToY(fc)}
                stroke={colors.grid}
                strokeDasharray="2 2"
                strokeWidth={0.5}
              />
            ))}

            {/* Q4: Grid vertical (a/c) - inferior direito */}
            {acTicks.map((ac) => (
              <line
                key={`grid-ac-bot-${ac}`}
                x1={acToX(ac)}
                y1={centerY}
                x2={acToX(ac)}
                y2={height - margin.bottom}
                stroke={colors.grid}
                strokeDasharray="2 2"
                strokeWidth={0.5}
              />
            ))}
            {/* Q4: Grid horizontal (m) - inferior direito */}
            {mTicks.map((m) => (
              <line
                key={`grid-m-right-${m}`}
                x1={centerX}
                y1={mToY(m)}
                x2={width - margin.right}
                y2={mToY(m)}
                stroke={colors.grid}
                strokeDasharray="2 2"
                strokeWidth={0.5}
              />
            ))}

            {/* Q3: Grid vertical (m) - inferior esquerdo */}
            {mTicks.map((m) => (
              <line
                key={`grid-m-left-${m}`}
                x1={mToXLeft(m)}
                y1={centerY}
                x2={mToXLeft(m)}
                y2={height - margin.bottom}
                stroke={colors.grid}
                strokeDasharray="2 2"
                strokeWidth={0.5}
              />
            ))}
            {/* Q3: Grid VERTICAL (C) - inferior esquerdo (C no eixo X) */}
            {cTicks.map((c) => (
              <line
                key={`grid-c-bot-${c}`}
                x1={cToXLeft(c)}
                y1={centerY}
                x2={cToXLeft(c)}
                y2={height - margin.bottom}
                stroke={colors.grid}
                strokeDasharray="2 2"
                strokeWidth={0.5}
              />
            ))}

            {/* Q1: Grid VERTICAL (C) - superior esquerdo */}
            {cTicks.map((c) => (
              <line
                key={`grid-c-top-${c}`}
                x1={cToXLeft(c)}
                y1={margin.top}
                x2={cToXLeft(c)}
                y2={centerY}
                stroke={colors.grid}
                strokeDasharray="2 2"
                strokeWidth={0.5}
              />
            ))}

            {/* ========== EIXOS PRINCIPAIS ========== */}

            {/* Eixo horizontal central */}
            <line
              x1={margin.left}
              y1={centerY}
              x2={width - margin.right}
              y2={centerY}
              stroke={colors.axis}
              strokeWidth={1.5}
            />

            {/* Eixo vertical central */}
            <line
              x1={centerX}
              y1={margin.top}
              x2={centerX}
              y2={height - margin.bottom}
              stroke={colors.axis}
              strokeWidth={1.5}
            />

            {/* ========== TICK MARKS ON CENTRAL AXES ========== */}

            {/* Ticks para a/c (eixo horizontal central) */}
            {acTicks.map((ac) => (
              <line
                key={`tick-line-ac-${ac}`}
                x1={acToX(ac)}
                y1={centerY - 3}
                x2={acToX(ac)}
                y2={centerY + 3}
                stroke={colors.axis}
                strokeWidth={1}
              />
            ))}

            {/* Ticks para fc (eixo vertical central, parte superior) */}
            {fcTicks.map((fc) => (
              <line
                key={`tick-line-fc-${fc}`}
                x1={centerX - 3}
                y1={fcToY(fc)}
                x2={centerX + 3}
                y2={fcToY(fc)}
                stroke={colors.axis}
                strokeWidth={1}
              />
            ))}

            {/* Ticks para m (eixo vertical central, parte inferior) */}
            {mTicks.map((m) => (
              <line
                key={`tick-line-m-vertical-${m}`}
                x1={centerX - 3}
                y1={mToY(m)}
                x2={centerX + 3}
                y2={mToY(m)}
                stroke={colors.axis}
                strokeWidth={1}
              />
            ))}

            {/* Ticks para C (eixo horizontal central, parte esquerda) */}
            {cTicks.map((c) => (
              <line
                key={`tick-line-c-${c}`}
                x1={cToXLeft(c)}
                y1={centerY - 3}
                x2={cToXLeft(c)}
                y2={centerY + 3}
                stroke={colors.axis}
                strokeWidth={1}
              />
            ))}

            {/* ========== LABELS DOS EIXOS ========== */}

            {/* fc (MPa) - Q2 superior - Centralizado no eixo Y */}
            <text
              x={centerX}
              y={margin.top - 25}
              fill={colors.axis}
              fontSize={13}
              fontWeight="bold"
              textAnchor="middle"
            >
              Resistência à Compressão - Fc
            </text>

            {/* a/c - eixo X direito */}
            <text
              x={width - margin.right + 10}
              y={centerY + 5}
              fill={colors.axis}
              fontSize={12}
              fontWeight="bold"
              textAnchor="start"
            >
              a/c
            </text>
            <text
              x={width - margin.right - 60}
              y={centerY + 30}
              fill={colors.text}
              fontSize={11}
              textAnchor="end"
            >
              Relação a/c
            </text>

            {/* C (kg/m³) - eixo X inferior do Q3 - rótulo na ponta esquerda (oposto a a/c) */}
            <text
              x={margin.left - 10}
              y={centerY + 5}
              fill={colors.axis}
              fontSize={12}
              fontWeight="bold"
              textAnchor="end"
            >
              Ci (kg/m³)
            </text>

            {/* m (kg) - eixo inferior */}
            <text
              x={centerX}
              y={height - margin.bottom + 55}
              fill={colors.axis}
              fontSize={12}
              fontWeight="bold"
              textAnchor="middle"
            >
              m - Kg/Kg
            </text>
            <text
              x={centerX + 100}
              y={height - margin.bottom + 35}
              fill={colors.text}
              fontSize={11}
              textAnchor="middle"
              transform={`rotate(-90 ${width - margin.right + 25} ${
                height / 2
              })`}
            ></text>

            {/* Relação agregado/Cimento - Q4 */}
            <text
              x={width - margin.right - 60}
              y={height - margin.bottom - 10}
              fill={colors.axis}
              fontSize={11}
              fontWeight="500"
              textAnchor="end"
              transform={`rotate(-90 ${width - margin.right - 10} ${
                centerY + bottomHeight / 2
              })`}
            ></text>

            {/* ========== TICK LABELS ========== */}

            {/* fc ticks (Q2) */}
            {fcTicks.map((fc) => (
              <text
                key={`tick-fc-${fc}`}
                x={centerX + 8}
                y={fcToY(fc) + 4}
                fill={colors.text}
                fontSize={10}
                textAnchor="start"
              >
                {fc}
              </text>
            ))}

            {/* a/c ticks (eixo horizontal central) */}
            {acTicks.map((ac) => (
              <text
                key={`tick-ac-${ac}`}
                x={acToX(ac)}
                y={centerY - 8}
                fill={colors.text}
                fontSize={10}
                textAnchor="middle"
              >
                {ac.toFixed(1)}
              </text>
            ))}

            {/* m ticks à direita (Q4) */}
            {mTicks.map((m) => (
              <text
                key={`tick-m-right-${m}`}
                x={centerX + 8}
                y={mToY(m) + 4}
                fill={colors.text}
                fontSize={10}
                textAnchor="start"
              >
                {m}
              </text>
            ))}

            {/* m ticks inferiores (Q3/Q4) */}
            {mTicks.map((m) => (
              <text
                key={`tick-m-bot-${m}`}
                x={mToXLeft(m)}
                y={height - margin.bottom + 18}
                fill={colors.text}
                fontSize={10}
                textAnchor="middle"
              >
                {m}
              </text>
            ))}

            {/* C ticks Q3 (eixo X inferior - C no eixo horizontal) */}
            {cTicks.map((c) => (
              <text
                key={`tick-c-bot-${c}`}
                x={cToXLeft(c)}
                y={centerY + 15}
                fill={colors.text}
                fontSize={10}
                textAnchor="middle"
              >
                {c}
              </text>
            ))}

            {/* ========== CURVAS ========== */}

            {/* Q2: Curva de Abrams */}
            <path
              d={pointsToPath(abramsCurve)}
              fill="none"
              stroke={colors.abrams}
              strokeWidth={2.5}
            />

            {/* Q4: Curva de Lyse */}
            <path
              d={pointsToPath(lyseCurve)}
              fill="none"
              stroke={colors.lyse}
              strokeWidth={2.5}
            />

            {/* Q3: Curva de Molinari */}
            <path
              d={pointsToPath(molinariCurve)}
              fill="none"
              stroke={colors.molinari}
              strokeWidth={2.5}
            />

            {/* ========== LABELS DAS LEIS ========== */}

            {/* Abrams */}
            <text
              x={width - margin.right - 20}
              y={margin.top + 30}
              fill={colors.abrams}
              fontSize={13}
              fontWeight="bold"
              textAnchor="end"
            >
              Abrams
            </text>
            <text
              x={width - margin.right - 20}
              y={margin.top + 48}
              fill={colors.text}
              fontSize={10}
              textAnchor="end"
              fontStyle="italic"
            >
              fcj = k₁/k₂^(a/c)
            </text>
            <text
              x={width - margin.right - 20}
              y={margin.top + 62}
              fill={colors.text}
              fontSize={9}
              textAnchor="end"
            >
              R² = {coefficients.abrams.r2.toFixed(4)}
            </text>

            {/* Lyse */}
            <text
              x={width - margin.right - 20}
              y={height - margin.bottom - 50}
              fill={colors.lyse}
              fontSize={13}
              fontWeight="bold"
              textAnchor="end"
            >
              Lyse
            </text>
            <text
              x={width - margin.right - 20}
              y={height - margin.bottom - 32}
              fill={colors.text}
              fontSize={10}
              textAnchor="end"
              fontStyle="italic"
            >
              m = k₃ + k₄ · a/c
            </text>
            <text
              x={width - margin.right - 20}
              y={height - margin.bottom - 18}
              fill={colors.text}
              fontSize={9}
              textAnchor="end"
            >
              R² = {coefficients.lyse.r2.toFixed(4)}
            </text>

            {/* Molinari */}
            <text
              x={margin.left + 20}
              y={height - margin.bottom - 50}
              fill={colors.molinari}
              fontSize={13}
              fontWeight="bold"
              textAnchor="start"
            >
              Molinari
            </text>
            <text
              x={margin.left + 20}
              y={height - margin.bottom - 32}
              fill={colors.text}
              fontSize={10}
              textAnchor="start"
              fontStyle="italic"
            >
              C = 1000/(k₅ + k₆·m)
            </text>
            <text
              x={margin.left + 20}
              y={height - margin.bottom - 18}
              fill={colors.text}
              fontSize={9}
              textAnchor="start"
            >
              R² = {coefficients.molinari.r2.toFixed(4)}
            </text>

            {/* ========== PONTOS EXPERIMENTAIS (Interativos) ========== */}

            {/* Q2: Pontos Abrams */}
            {experimentalPoints.map((p, i) => (
              <circle
                key={`exp-abrams-${i}`}
                cx={acToX(p.ac)}
                cy={fcToY(p.fcj)}
                r={6}
                fill={colors.experimental}
                stroke={darkMode ? "#0f172a" : "#ffffff"}
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onMouseEnter={() =>
                  setTooltip({
                    show: true,
                    x: acToX(p.ac),
                    y: fcToY(p.fcj) - 20,
                    content: `Ponto ${i + 1}: a/c=${p.ac.toFixed(
                      2
                    )}, fc=${p.fcj.toFixed(1)} MPa`,
                    type: "experimental",
                  })
                }
                onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
              />
            ))}

            {/* Q4: Pontos Lyse */}
            {experimentalPoints.map((p, i) => (
              <circle
                key={`exp-lyse-${i}`}
                cx={acToX(p.ac)}
                cy={mToY(p.m)}
                r={6}
                fill={colors.experimental}
                stroke={darkMode ? "#0f172a" : "#ffffff"}
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onMouseEnter={() =>
                  setTooltip({
                    show: true,
                    x: acToX(p.ac),
                    y: mToY(p.m) - 20,
                    content: `Ponto ${i + 1}: a/c=${p.ac.toFixed(
                      2
                    )}, m=${p.m.toFixed(2)}`,
                    type: "experimental",
                  })
                }
                onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
              />
            ))}

            {/* Q3: Pontos Molinari (Experimental) */}
            {experimentalPoints.map((p, i) => {
              // Calcular C experimental: C = density / (1 + m + a/c)
              // density deve estar em kg/m³
              if (!p.density) return null;

              // Converter para C
              // MolinariService usa: C = (1000 * (density/1000)) / (1 + m + ac)
              // Simplificando: C = density / (1 + m + ac)
              const cExp = p.density / (1 + p.m + p.ac);

              return (
                <circle
                  key={`exp-molinari-${i}`}
                  cx={cToXLeft(cExp)}
                  cy={mToY(p.m)}
                  r={6}
                  fill={colors.experimental}
                  stroke={darkMode ? "#0f172a" : "#ffffff"}
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() =>
                    setTooltip({
                      show: true,
                      x: cToXLeft(cExp),
                      y: mToY(p.m) - 20,
                      content: `Ponto ${i + 1}: C=${cExp.toFixed(
                        0
                      )} kg/m³, m=${p.m.toFixed(2)}`,
                      type: "experimental",
                    })
                  }
                  onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                />
              );
            })}

            {/* ========== LINHAS DE REFERÊNCIA (Fluxo de extração) ========== */}

            {/* Seta de entrada (Q1 → Q2) */}
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth={6}
                markerHeight={6}
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.target} />
              </marker>
            </defs>

            {/* Seta vertical indicando Ci (Q1) */}
            <path
              d={`M ${targetCX} ${margin.top + 20} L ${targetCX} ${
                centerY - 10
              }`}
              fill="none"
              stroke={colors.target}
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />

            {/* Linha horizontal: fcj → Abrams (Q2) */}
            <line
              x1={centerX}
              y1={targetFcY}
              x2={targetAcX}
              y2={targetFcY}
              stroke={colors.target}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />

            {/* Linha vertical: Abrams → Lyse (Q2 → Q4) */}
            <line
              x1={targetAcX}
              y1={targetFcY}
              x2={targetAcX}
              y2={targetMY}
              stroke={colors.target}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />

            {/* Linha horizontal: Lyse → eixo central (Q4 → centro) */}
            <line
              x1={targetAcX}
              y1={targetMY}
              x2={centerX}
              y2={targetMY}
              stroke={colors.target}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />

            {/* Linha vertical: centro → m no Q3 */}
            <line
              x1={centerX}
              y1={targetMY}
              x2={targetCX}
              y2={targetMY}
              stroke={colors.target}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />

            {/* Linha horizontal: ponto Molinari (targetCX, targetMY) */}
            {/* Já conectado acima */}

            {/* Linha vertical: Molinari → eixo C (subindo) */}
            <line
              x1={targetCX}
              y1={targetMY}
              x2={targetCX}
              y2={centerY}
              stroke={colors.target}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />

            {/* Linha horizontal: eixo C para leitura final */}
            <line
              x1={targetCX}
              y1={centerY}
              x2={margin.left}
              y2={centerY}
              stroke={colors.target}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              opacity={0.5}
            />

            {/* ========== PONTOS DE INTERSEÇÃO ALVO (Interativos) ========== */}

            {/* Ponto 1: Abrams (a/c, fc) */}
            <circle
              cx={targetAcX}
              cy={targetFcY}
              r={8}
              fill={colors.targetDot}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: "pointer" }}
              onMouseEnter={() =>
                setTooltip({
                  show: true,
                  x: targetAcX,
                  y: targetFcY - 25,
                  content: `Abrams: a/c=${parameters.targetAC.toFixed(
                    3
                  )}, fcj=${parameters.fcjTarget.toFixed(1)} MPa`,
                  type: "target",
                })
              }
              onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
            />

            {/* Ponto 2: Lyse (a/c, m) */}
            <circle
              cx={targetAcX}
              cy={targetMY}
              r={8}
              fill={colors.targetDot}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: "pointer" }}
              onMouseEnter={() =>
                setTooltip({
                  show: true,
                  x: targetAcX,
                  y: targetMY - 25,
                  content: `Lyse: a/c=${parameters.targetAC.toFixed(
                    3
                  )}, m=${parameters.targetM.toFixed(2)}`,
                  type: "target",
                })
              }
              onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
            />

            {/* Ponto 3: Molinari (C, m) - C no eixo X, m no eixo Y */}
            <circle
              cx={targetCX}
              cy={targetMY}
              r={8}
              fill={colors.targetDot}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: "pointer" }}
              onMouseEnter={() =>
                setTooltip({
                  show: true,
                  x: targetCX,
                  y: targetMY - 25,
                  content: `Molinari: m=${parameters.targetM.toFixed(
                    2
                  )}, C=${Math.round(cementConsumption)} kg/m³`,
                  type: "target",
                })
              }
              onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
            />

            {/* Labels dos valores calculados */}
            <text
              x={targetAcX}
              y={centerY - 25}
              fill={colors.target}
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              a/c {parameters.targetAC.toFixed(2)}
            </text>
            <text
              x={centerX + 35}
              y={targetMY + 4}
              fill={colors.target}
              fontSize={11}
              fontWeight="bold"
              textAnchor="start"
            >
              m {parameters.targetM.toFixed(2)}
            </text>
            <text
              x={targetCX}
              y={centerY + 35}
              fill={colors.target}
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              Ci {Math.round(cementConsumption)}
            </text>

            {/* ========== LEGENDA ========== */}
            <g transform={`translate(${margin.left + 20}, ${margin.top + 20})`}>
              <circle cx={0} cy={0} r={5} fill={colors.experimental} />
              <text x={12} y={4} fill={colors.text} fontSize={10}>
                Pontos experimentais
              </text>
              <circle cx={0} cy={18} r={5} fill={colors.targetDot} />
              <text x={12} y={22} fill={colors.text} fontSize={10}>
                Valores de dosagem
              </text>
            </g>

            {/* ========== TOOLTIP ========== */}
            {tooltip.show && (
              <g>
                <rect
                  x={tooltip.x - 110}
                  y={tooltip.y - 22}
                  width={220}
                  height={28}
                  rx={4}
                  fill={darkMode ? "#1e293b" : "#ffffff"}
                  stroke={
                    tooltip.type === "target"
                      ? colors.targetDot
                      : colors.experimental
                  }
                  strokeWidth={1.5}
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
                <text
                  x={tooltip.x}
                  y={tooltip.y - 4}
                  fill={darkMode ? "#e2e8f0" : "#1f2937"}
                  fontSize={11}
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {tooltip.content}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Resumo dos valores */}
        <div
          className={`mt-4 grid grid-cols-4 gap-4 text-center p-4 rounded-lg ${
            darkMode ? "bg-slate-800" : "bg-slate-50"
          }`}
        >
          <div>
            <div
              className={`text-xs uppercase ${
                darkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              fcj alvo
            </div>
            <div
              className={`text-lg font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {parameters.fcjTarget.toFixed(1)} MPa
            </div>
          </div>
          <div>
            <div
              className={`text-xs uppercase ${
                darkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              a/c
            </div>
            <div
              className={`text-lg font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {parameters.targetAC.toFixed(3)}
            </div>
          </div>
          <div>
            <div
              className={`text-xs uppercase ${
                darkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              m (traço seco)
            </div>
            <div
              className={`text-lg font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {parameters.targetM.toFixed(2)}
            </div>
          </div>
          <div>
            <div
              className={`text-xs uppercase ${
                darkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Consumo C
            </div>
            <div
              className={`text-lg font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {Math.round(cementConsumption)} kg/m³
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
