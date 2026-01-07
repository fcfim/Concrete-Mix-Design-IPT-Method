/**
 * NBR6118Service - Requisitos de Durabilidade
 *
 * Implementa as verificações de durabilidade conforme NBR 6118:2023
 * (Projeto de estruturas de concreto - Procedimento).
 *
 * Principais verificações:
 * - Relação água/cimento máxima por classe de agressividade
 * - Resistência mínima (fck) por classe de agressividade
 * - Consumo mínimo de cimento
 *
 * @see NBR 6118:2023 - Tabela 7.1
 */

/**
 * Limites normativos para durabilidade
 */
export interface NormativeLimits {
  /** Relação água/cimento máxima em massa */
  maxAC: number;
  /** Resistência característica mínima (MPa) */
  minFck: number;
  /** Consumo mínimo de cimento (kg/m³) - conforme NBR 12655 */
  minCement: number;
}

/**
 * Resultado da validação normativa
 */
export interface NormativeValidation {
  /** Indica se o valor está dentro do limite */
  valid: boolean;
  /** Valor original */
  original: number;
  /** Valor ajustado (se necessário) */
  adjusted: number;
  /** Mensagem de aviso (se ajustado) */
  warning?: string;
}

/**
 * Tipo de estrutura
 */
export type ElementType = "CA" | "CP";

/**
 * Classe de Agressividade Ambiental
 */
export type AggressivenessClass = 1 | 2 | 3 | 4;

export class NBR6118Service {
  /**
   * Tabela 7.1 - NBR 6118:2023 - Concreto Armado (CA)
   */
  private static readonly LIMITS_CA: Record<
    AggressivenessClass,
    NormativeLimits
  > = {
    1: { maxAC: 0.65, minFck: 20, minCement: 260 },
    2: { maxAC: 0.6, minFck: 25, minCement: 280 },
    3: { maxAC: 0.55, minFck: 30, minCement: 320 },
    4: { maxAC: 0.45, minFck: 40, minCement: 360 },
  };

  /**
   * Tabela 7.1 - NBR 6118:2023 - Concreto Protendido (CP)
   */
  private static readonly LIMITS_CP: Record<
    AggressivenessClass,
    NormativeLimits
  > = {
    1: { maxAC: 0.6, minFck: 25, minCement: 280 },
    2: { maxAC: 0.55, minFck: 30, minCement: 320 },
    3: { maxAC: 0.5, minFck: 35, minCement: 360 },
    4: { maxAC: 0.45, minFck: 40, minCement: 400 },
  };

  /**
   * Descrição das classes de agressividade ambiental
   */
  private static readonly CAA_DESCRIPTIONS: Record<
    AggressivenessClass,
    string
  > = {
    1: "Fraca (rural, submersa)",
    2: "Moderada (urbana)",
    3: "Forte (marinha, industrial)",
    4: "Muito forte (respingos de maré, industrial agressivo)",
  };

  /**
   * Obtém os limites normativos para uma classe de agressividade e tipo de elemento
   *
   * @param caa Classe de Agressividade Ambiental (1-4)
   * @param elementType Tipo de elemento (CA ou CP)
   * @returns Limites normativos aplicáveis
   */
  static getLimits(
    caa: AggressivenessClass,
    elementType: ElementType
  ): NormativeLimits {
    return elementType === "CA" ? this.LIMITS_CA[caa] : this.LIMITS_CP[caa];
  }

  /**
   * Obtém a descrição da classe de agressividade
   */
  static getCAADescription(caa: AggressivenessClass): string {
    return this.CAA_DESCRIPTIONS[caa];
  }

  /**
   * Valida e ajusta a relação água/cimento conforme limites normativos
   *
   * @param ac Relação a/c calculada
   * @param caa Classe de Agressividade Ambiental
   * @param elementType Tipo de elemento (CA ou CP)
   * @returns Resultado da validação com possível ajuste
   */
  static validateAC(
    ac: number,
    caa: AggressivenessClass,
    elementType: ElementType
  ): NormativeValidation {
    const limits = this.getLimits(caa, elementType);

    if (ac > limits.maxAC) {
      return {
        valid: false,
        original: ac,
        adjusted: limits.maxAC,
        warning: `Relação a/c limitada de ${ac.toFixed(3)} para ${
          limits.maxAC
        } conforme NBR 6118:2023 Tab. 7.1 (CAA ${caa} - ${
          this.CAA_DESCRIPTIONS[caa]
        }, ${elementType})`,
      };
    }

    return {
      valid: true,
      original: ac,
      adjusted: ac,
    };
  }

  /**
   * Valida e ajusta o consumo de cimento conforme limites normativos
   *
   * @param cement Consumo de cimento calculado (kg/m³)
   * @param caa Classe de Agressividade Ambiental
   * @param elementType Tipo de elemento (CA ou CP)
   * @returns Resultado da validação com possível ajuste
   */
  static validateCement(
    cement: number,
    caa: AggressivenessClass,
    elementType: ElementType
  ): NormativeValidation {
    const limits = this.getLimits(caa, elementType);

    if (cement < limits.minCement) {
      return {
        valid: false,
        original: cement,
        adjusted: limits.minCement,
        warning: `Consumo de cimento ajustado de ${Math.round(cement)} para ${
          limits.minCement
        } kg/m³ conforme NBR 6118:2023 (CAA ${caa}, ${elementType})`,
      };
    }

    return {
      valid: true,
      original: cement,
      adjusted: cement,
    };
  }

  /**
   * Valida se o fck atende ao mínimo normativo
   *
   * @param fck Resistência característica (MPa)
   * @param caa Classe de Agressividade Ambiental
   * @param elementType Tipo de elemento (CA ou CP)
   * @returns Resultado da validação
   */
  static validateFck(
    fck: number,
    caa: AggressivenessClass,
    elementType: ElementType
  ): NormativeValidation {
    const limits = this.getLimits(caa, elementType);

    if (fck < limits.minFck) {
      return {
        valid: false,
        original: fck,
        adjusted: limits.minFck,
        warning: `fck mínimo para CAA ${caa} (${elementType}) é ${limits.minFck} MPa. Valor informado: ${fck} MPa`,
      };
    }

    return {
      valid: true,
      original: fck,
      adjusted: fck,
    };
  }
}
