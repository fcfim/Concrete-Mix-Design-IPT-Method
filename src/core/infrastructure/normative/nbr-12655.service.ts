/**
 * NBR12655Service - Resistência de Dosagem
 *
 * Implementa o cálculo da resistência de dosagem conforme NBR 12655:2022
 * (Concreto de cimento Portland - Preparo, controle, recebimento e aceitação).
 *
 * A resistência de dosagem (fcj) é a resistência que deve ser buscada
 * no estudo de dosagem para garantir que o concreto produzido tenha
 * pelo menos a resistência característica (fck) especificada.
 *
 * fcj = fck + 1,65 × Sd
 *
 * Onde:
 * - fcj: Resistência de dosagem (MPa)
 * - fck: Resistência característica (MPa)
 * - Sd: Desvio padrão da produção (MPa)
 *
 * @see NBR 12655:2022 - Item 6.4
 */

/**
 * Condição de preparo do concreto
 */
export type PreparationCondition = "A" | "B" | "C";

/**
 * Descrição das condições de preparo
 */
export interface ConditionDescription {
  condition: PreparationCondition;
  sd: number;
  description: string;
}

export class NBR12655Service {
  /**
   * Desvios padrão por condição de preparo (NBR 12655:2022 Tab. 2)
   *
   * Condição A: Sd = 4,0 MPa
   * - Cimento e agregados medidos em massa
   * - Água adicionada em massa ou volume com correção de umidade
   * - Determinação regular da umidade dos agregados
   *
   * Condição B: Sd = 5,5 MPa
   * - Cimento medido em massa
   * - Agregados medidos em volume
   * - Água medida em volume com correção estimada de umidade
   *
   * Condição C: Sd = 7,0 MPa
   * - Cimento medido em massa
   * - Agregados medidos em volume
   * - Água medida em volume sem correção de umidade
   */
  private static readonly SD_VALUES: Record<PreparationCondition, number> = {
    A: 4.0,
    B: 5.5,
    C: 7.0,
  };

  private static readonly CONDITION_DESCRIPTIONS: Record<
    PreparationCondition,
    string
  > = {
    A: "Controle rigoroso: massa para todos os materiais, correção de umidade",
    B: "Controle razoável: massa para cimento, volume para agregados, correção estimada",
    C: "Controle regular: massa para cimento, volume para agregados, sem correção",
  };

  /**
   * Obtém o desvio padrão para uma condição de preparo
   *
   * @param condition Condição de preparo (A, B ou C)
   * @returns Desvio padrão em MPa
   */
  static getStandardDeviation(condition: PreparationCondition): number {
    return this.SD_VALUES[condition];
  }

  /**
   * Obtém a lista completa de condições de preparo
   */
  static getAllConditions(): ConditionDescription[] {
    return (["A", "B", "C"] as PreparationCondition[]).map((condition) => ({
      condition,
      sd: this.SD_VALUES[condition],
      description: this.CONDITION_DESCRIPTIONS[condition],
    }));
  }

  /**
   * Calcula a resistência de dosagem (fcj)
   *
   * fcj = fck + 1,65 × Sd
   *
   * O fator 1,65 corresponde ao quantil 5% da distribuição normal,
   * garantindo que apenas 5% dos corpos de prova tenham resistência
   * inferior ao fck especificado.
   *
   * @param fck Resistência característica (MPa)
   * @param sd Desvio padrão (MPa)
   * @returns Resistência de dosagem (MPa)
   */
  static calculateDosageStrength(fck: number, sd: number): number {
    if (fck <= 0) {
      throw new Error("Resistência característica (fck) deve ser positiva");
    }
    if (sd <= 0) {
      throw new Error("Desvio padrão (Sd) deve ser positivo");
    }

    const fcj = fck + 1.65 * sd;
    return Math.round(fcj * 100) / 100; // Arredonda para 2 casas
  }

  /**
   * Calcula a resistência de dosagem usando condição de preparo
   *
   * @param fck Resistência característica (MPa)
   * @param condition Condição de preparo (A, B ou C)
   * @returns Resistência de dosagem (MPa)
   */
  static calculateFromCondition(
    fck: number,
    condition: PreparationCondition
  ): number {
    const sd = this.getStandardDeviation(condition);
    return this.calculateDosageStrength(fck, sd);
  }

  /**
   * Infere a condição de preparo a partir do desvio padrão informado
   *
   * @param sd Desvio padrão informado
   * @returns Condição de preparo mais próxima ou null se fora do range
   */
  static inferCondition(sd: number): PreparationCondition | null {
    if (sd <= 4.75) return "A";
    if (sd <= 6.25) return "B";
    if (sd <= 7.5) return "C";
    return null; // Sd muito alto, fora da norma
  }
}
