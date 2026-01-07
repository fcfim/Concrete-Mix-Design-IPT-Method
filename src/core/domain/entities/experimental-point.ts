/**
 * ExperimentalPoint - Entidade representando um ponto do estudo experimental
 *
 * O Método IPT/EPUSP requer 3 pontos experimentais:
 * - Traço Rico (baixo m, alto fcj)
 * - Traço Piloto (m intermediário)
 * - Traço Pobre (alto m, baixo fcj)
 *
 * @see NBR 12655:2022 - Concreto de cimento Portland
 */
export interface ExperimentalPoint {
  /** Traço seco (proporção agregados/cimento) - Ex: 3.5, 5.0, 6.5 */
  m: number;

  /** Relação água/cimento em massa - Ex: 0.45, 0.58, 0.72 */
  ac: number;

  /** Resistência à compressão aos 28 dias (MPa) - Ex: 42, 32, 22 */
  fcj: number;

  /** Massa específica do concreto fresco (kg/m³) - Ex: 2350, 2300, 2250 */
  density: number;
}

/**
 * Valida se um ponto experimental possui valores válidos
 */
export function isValidExperimentalPoint(point: ExperimentalPoint): boolean {
  return (
    point.m > 0 &&
    point.ac > 0 &&
    point.ac < 1 &&
    point.fcj > 0 &&
    point.density > 1500 &&
    point.density < 3000
  );
}
