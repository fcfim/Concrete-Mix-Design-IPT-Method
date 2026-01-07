/**
 * Zod Schemas para Validação da API de Dosagem
 *
 * Define schemas de validação para entrada e saída da API,
 * garantindo type-safety e mensagens de erro claras.
 */
import { z } from "zod";

/**
 * Schema para ponto experimental
 */
export const experimentalPointSchema = z.object({
  m: z
    .number()
    .positive("Traço seco (m) deve ser positivo")
    .max(15, "Traço seco (m) deve ser no máximo 15"),
  ac: z
    .number()
    .positive("Relação a/c deve ser positiva")
    .max(1, "Relação a/c deve ser no máximo 1.0"),
  fcj: z
    .number()
    .positive("Resistência (fcj) deve ser positiva")
    .max(200, "Resistência (fcj) deve ser no máximo 200 MPa"),
  density: z
    .number()
    .min(1500, "Massa específica deve ser no mínimo 1500 kg/m³")
    .max(3000, "Massa específica deve ser no máximo 3000 kg/m³"),
});

/**
 * Schema para alvo de dosagem
 */
export const dosageTargetSchema = z.object({
  fck: z
    .number()
    .min(10, "fck mínimo é 10 MPa")
    .max(100, "fck máximo é 100 MPa"),
  sd: z
    .number()
    .min(2, "Desvio padrão mínimo é 2 MPa")
    .max(10, "Desvio padrão máximo é 10 MPa"),
  aggressivenessClass: z
    .number()
    .int("Classe de agressividade deve ser inteiro")
    .min(1, "Classe de agressividade mínima é 1")
    .max(4, "Classe de agressividade máxima é 4"),
  elementType: z.enum(["CA", "CP"]),
  slump: z
    .number()
    .min(0, "Abatimento mínimo é 0 mm")
    .max(250, "Abatimento máximo é 250 mm"),
  mortarContent: z
    .number()
    .min(40, "Teor de argamassa mínimo é 40%")
    .max(65, "Teor de argamassa máximo é 65%"),
});

/**
 * Schema completo para entrada da API
 */
export const dosageInputSchema = z.object({
  experimentalPoints: z
    .array(experimentalPointSchema)
    .min(
      3,
      "São necessários pelo menos 3 pontos experimentais (Rico, Piloto, Pobre)"
    )
    .max(10, "Máximo de 10 pontos experimentais"),
  target: dosageTargetSchema,
});

/**
 * Tipos inferidos dos schemas
 */
export type ExperimentalPointInput = z.infer<typeof experimentalPointSchema>;
export type DosageTargetInput = z.infer<typeof dosageTargetSchema>;
export type DosageInput = z.infer<typeof dosageInputSchema>;

/**
 * Schema para resposta de erro
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z
      .array(
        z.object({
          path: z.array(z.string()),
          message: z.string(),
        })
      )
      .optional(),
  }),
});

/**
 * Formata erros Zod para resposta da API
 */
export function formatZodErrors(error: z.ZodError<unknown>) {
  return error.issues.map((issue) => ({
    path: issue.path.map(String),
    message: issue.message,
  }));
}
