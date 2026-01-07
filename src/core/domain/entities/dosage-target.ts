/**
 * DosageTarget - Especificação do concreto desejado
 *
 * Define os requisitos para o concreto a ser dosado:
 * - Resistência característica (fck)
 * - Condições de preparo (desvio padrão)
 * - Requisitos de durabilidade (NBR 6118)
 *
 * @see NBR 6118:2023 - Projeto de estruturas de concreto
 * @see NBR 12655:2022 - Concreto de cimento Portland
 */
export interface DosageTarget {
  /** Resistência característica à compressão (MPa) - Ex: 25, 30, 40 */
  fck: number;

  /**
   * Desvio padrão (MPa) conforme condição de preparo (NBR 12655):
   * - Condição A: 4.0 MPa (controle rigoroso)
   * - Condição B: 5.5 MPa (controle razoável)
   * - Condição C: 7.0 MPa (controle regular)
   */
  sd: number;

  /**
   * Classe de Agressividade Ambiental (NBR 6118 Tab. 6.1):
   * - 1: Fraca (rural, submersa)
   * - 2: Moderada (urbana)
   * - 3: Forte (marinha, industrial)
   * - 4: Muito forte (respingos de maré, industrial agressivo)
   */
  aggressivenessClass: 1 | 2 | 3 | 4;

  /**
   * Tipo de elemento estrutural:
   * - CA: Concreto Armado
   * - CP: Concreto Protendido
   */
  elementType: "CA" | "CP";

  /** Abatimento desejado (mm) - Ex: 80, 100, 120 */
  slump: number;

  /**
   * Teor de argamassa ideal (%) - Ex: 52, 54
   * Determina a proporção de areia no traço
   */
  mortarContent: number;
}

/**
 * Condição de preparo segundo NBR 12655
 */
export type PreparationCondition = "A" | "B" | "C";

/**
 * Retorna o desvio padrão para uma condição de preparo
 */
export function getStandardDeviation(condition: PreparationCondition): number {
  const values: Record<PreparationCondition, number> = {
    A: 4.0,
    B: 5.5,
    C: 7.0,
  };
  return values[condition];
}
