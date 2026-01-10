/**
 * RoundingConfig - Configuração de arredondamento para uso em obra
 *
 * Define os incrementos de arredondamento para valores práticos de campo.
 *
 * @see Método IPT/EPUSP - Traço de betoneira
 */
export interface RoundingConfig {
  /** Incremento para água (litros): 1, 5 ou 10 */
  waterIncrement: 1 | 5 | 10;
  /** Incremento para cimento (kg): 1, 5 ou 50 (saco) */
  cementIncrement: 1 | 5 | 50;
  /** Incremento para agregados (kg): 1 ou 5 */
  aggregateIncrement: 1 | 5;
}

/**
 * FieldConsumption - Consumo arredondado para uso em obra
 */
export interface FieldConsumption {
  /** Consumo de cimento arredondado (kg/m³) */
  cement: number;
  /** Consumo de areia arredondado (kg/m³) */
  sand: number;
  /** Consumo de brita arredondado (kg/m³) */
  gravel: number;
  /** Consumo de água arredondado (litros/m³) */
  water: number;
  /** Número de sacos de cimento (apenas se cementIncrement = 50) */
  cementBags?: number;
}

/**
 * Configuração padrão para arredondamento de obra
 */
export const DEFAULT_ROUNDING_CONFIG: RoundingConfig = {
  waterIncrement: 1,
  cementIncrement: 1,
  aggregateIncrement: 1,
};
