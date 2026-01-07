/**
 * API Route: POST /api/v1/dosage
 *
 * Endpoint principal para cálculo de dosagem de concreto
 * pelo Método IPT/EPUSP.
 *
 * @example
 * POST /api/v1/dosage
 * Content-Type: application/json
 *
 * {
 *   "experimentalPoints": [
 *     { "m": 3.5, "ac": 0.45, "fcj": 42, "density": 2350 },
 *     { "m": 5.0, "ac": 0.58, "fcj": 32, "density": 2300 },
 *     { "m": 6.5, "ac": 0.72, "fcj": 22, "density": 2250 }
 *   ],
 *   "target": {
 *     "fck": 30,
 *     "sd": 5.5,
 *     "aggressivenessClass": 2,
 *     "elementType": "CA",
 *     "slump": 100,
 *     "mortarContent": 52
 *   }
 * }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dosageInputSchema,
  formatZodErrors,
} from "@/shared/lib/schemas/dosage.schema";
import { CalculateDosageUseCase } from "@/core/application/use-cases/calculate-dosage.use-case";
import { ExperimentalPoint, DosageTarget } from "@/core/domain/entities";

// Edge Runtime para baixa latência (opcional)
// export const runtime = 'edge';

/**
 * POST /api/v1/dosage
 *
 * Calcula a dosagem de concreto pelo método IPT/EPUSP
 */
export async function POST(request: Request) {
  try {
    // 1. Parse e validação do body
    const body = await request.json();
    const validated = dosageInputSchema.parse(body);

    // 2. Converter para tipos do domínio
    const experimentalPoints: ExperimentalPoint[] =
      validated.experimentalPoints.map((p) => ({
        m: p.m,
        ac: p.ac,
        fcj: p.fcj,
        density: p.density,
      }));

    const target: DosageTarget = {
      fck: validated.target.fck,
      sd: validated.target.sd,
      aggressivenessClass: validated.target.aggressivenessClass as
        | 1
        | 2
        | 3
        | 4,
      elementType: validated.target.elementType,
      slump: validated.target.slump,
      mortarContent: validated.target.mortarContent,
    };

    // 3. Executar cálculo
    const useCase = new CalculateDosageUseCase();
    const result = useCase.execute({ experimentalPoints, target });

    // 4. Retornar resposta de sucesso
    return NextResponse.json(
      {
        success: true,
        meta: {
          method: "IPT/EPUSP",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          normativeReferences: ["NBR 6118:2023", "NBR 12655:2022"],
        },
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    // Erro de validação Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados de entrada inválidos",
            details: formatZodErrors(error),
          },
        },
        { status: 400 }
      );
    }

    // Erro de domínio (cálculo)
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CALCULATION_ERROR",
            message: error.message,
          },
        },
        { status: 422 }
      );
    }

    // Erro desconhecido
    console.error("Erro inesperado:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro interno do servidor",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/dosage
 *
 * Retorna informações sobre o endpoint
 */
export async function GET() {
  return NextResponse.json({
    name: "Concrete Mix Design API - IPT/EPUSP Method",
    version: "1.0.0",
    description: "API para dosagem de concreto pelo Método IPT/EPUSP",
    documentation: "/api/v1/dosage/docs",
    endpoints: {
      "POST /api/v1/dosage": "Calcula dosagem de concreto",
    },
    normativeReferences: ["NBR 6118:2023", "NBR 12655:2022"],
    example: {
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
    },
  });
}
