/**
 * WaterCorrectionService - Correção de Água por Slump
 *
 * No método IPT/EPUSP, os pontos experimentais são produzidos com um slump
 * de referência (geralmente 100mm). Se o slump alvo for diferente, o consumo
 * de água deve ser corrigido.
 *
 * Regra empírica padrão (prática brasileira):
 * - ±3 L/m³ de água para cada ±10 mm de variação de slump
 * - Fator: 0.3 L/m³ por mm de variação
 *
 * @example
 * // Slump referência: 100mm, Slump alvo: 150mm
 * const correction = WaterCorrectionService.calculateCorrection(150, 100);
 * // correction = +15 L/m³ (mais água para maior slump)
 *
 * @example
 * // Slump referência: 100mm, Slump alvo: 60mm
 * const correction = WaterCorrectionService.calculateCorrection(60, 100);
 * // correction = -12 L/m³ (menos água para menor slump)
 */
export class WaterCorrectionService {
  /**
   * Fator de correção: L/m³ por mm de variação de slump
   * Derivado de ±3 L/m³ por ±10mm = 0.3 L/m³ por mm
   */
  private static readonly CORRECTION_FACTOR = 0.3;

  /**
   * Slump de referência padrão (mm)
   * Valor típico utilizado em ensaios experimentais do método IPT/EPUSP
   */
  private static readonly DEFAULT_REFERENCE_SLUMP = 100;

  /**
   * Limite de variação (mm) acima do qual um warning deve ser emitido
   */
  private static readonly WARNING_THRESHOLD = 50;

  /**
   * Calcula a correção de água baseada na diferença de slump
   *
   * @param targetSlump - Slump alvo do projeto (mm)
   * @param referenceSlump - Slump de referência dos ensaios (mm), default 100mm
   * @returns Correção de água em L/m³ (positivo = mais água, negativo = menos água)
   */
  static calculateCorrection(
    targetSlump: number,
    referenceSlump: number = this.DEFAULT_REFERENCE_SLUMP
  ): number {
    const deltaSlump = targetSlump - referenceSlump;
    return deltaSlump * this.CORRECTION_FACTOR;
  }

  /**
   * Aplica a correção de água ao consumo base
   *
   * @param baseWaterConsumption - Consumo de água base calculado (L/m³)
   * @param targetSlump - Slump alvo do projeto (mm)
   * @param referenceSlump - Slump de referência dos ensaios (mm)
   * @returns Consumo de água corrigido (L/m³)
   */
  static applyCorrection(
    baseWaterConsumption: number,
    targetSlump: number,
    referenceSlump: number = this.DEFAULT_REFERENCE_SLUMP
  ): number {
    const correction = this.calculateCorrection(targetSlump, referenceSlump);
    return baseWaterConsumption + correction;
  }

  /**
   * Verifica se a correção é significativa e gera um warning se necessário
   *
   * @param targetSlump - Slump alvo do projeto (mm)
   * @param referenceSlump - Slump de referência dos ensaios (mm)
   * @returns String de warning ou null se não for significativo
   */
  static getWarning(
    targetSlump: number,
    referenceSlump: number = this.DEFAULT_REFERENCE_SLUMP
  ): string | null {
    const deltaSlump = Math.abs(targetSlump - referenceSlump);

    if (deltaSlump > this.WARNING_THRESHOLD) {
      const correction = this.calculateCorrection(targetSlump, referenceSlump);
      const direction = correction > 0 ? "acréscimo" : "redução";
      return (
        `⚠️ Correção de água por slump: ${Math.abs(correction).toFixed(
          1
        )} L/m³ ` +
        `(${direction} devido à variação de ${deltaSlump}mm no slump). ` +
        `Considere verificar experimentalmente.`
      );
    }

    return null;
  }

  /**
   * Retorna o slump de referência padrão
   */
  static getDefaultReferenceSlump(): number {
    return this.DEFAULT_REFERENCE_SLUMP;
  }

  /**
   * Retorna o fator de correção utilizado
   */
  static getCorrectionFactor(): number {
    return this.CORRECTION_FACTOR;
  }
}
