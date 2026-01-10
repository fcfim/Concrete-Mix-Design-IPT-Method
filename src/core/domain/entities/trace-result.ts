/**
 * TraceResult - Resultado do cálculo de dosagem
 *
 * Contém o traço unitário final, consumos por m³ e parâmetros calculados.
 *
 * @see Método IPT/EPUSP
 */
export interface TraceResult {
  /** Traço unitário (proporções em relação ao cimento = 1) */
  finalTrace: {
    /** Cimento (sempre 1) */
    cement: 1;
    /** Areia (agregado miúdo) */
    sand: number;
    /** Brita (agregado graúdo) */
    gravel: number;
    /** Água (relação a/c) */
    water: number;
  };

  /** Consumo de materiais por m³ de concreto (kg/m³) */
  consumption: {
    /** Consumo de cimento */
    cement: number;
    /** Consumo de areia */
    sand: number;
    /** Consumo de brita */
    gravel: number;
    /** Consumo de água (litros/m³) */
    water: number;
  };

  /** Parâmetros intermediários do cálculo */
  parameters: {
    /** Resistência de dosagem fcj (MPa) */
    fcjTarget: number;
    /** Relação a/c calculada */
    targetAC: number;
    /** Traço seco total (m) */
    targetM: number;
  };

  /** Coeficientes das leis de comportamento */
  coefficients: {
    /** Lei de Abrams: fcj = k1 / k2^(a/c) */
    abrams: { k1: number; k2: number; r2: number };
    /** Lei de Lyse: m = k3 + k4 * (a/c) */
    lyse: { k3: number; k4: number; r2: number };
    /** Lei de Molinari: C = 1000 / (k5 + k6 * m) */
    molinari: { k5: number; k6: number; r2: number };
  };

  /** Faixa dos pontos experimentais para validação de extrapolação */
  experimentalRange: {
    /** Menor fcj experimental (MPa) */
    minFcj: number;
    /** Maior fcj experimental (MPa) */
    maxFcj: number;
    /** True se fcjTarget está fora do range experimental */
    isExtrapolating: boolean;
    /** Distância percentual fora do range (se extrapolando) */
    extrapolationPercent?: number;
  };

  /** Consumo arredondado para obra (opcional, se RoundingConfig fornecido) */
  fieldConsumption?: {
    cement: number;
    sand: number;
    gravel: number;
    water: number;
    cementBags?: number;
  };

  /** Resultado do cálculo de batches (opcional, se ContainerConfig fornecido) */
  batchResult?: {
    /** Volume do recipiente (m³) */
    containerVolume: number;
    /** Volume total desejado (m³) */
    totalVolume: number;
    /** Número de batches necessários */
    numberOfBatches: number;
    /** Material por batch */
    perBatch: {
      cement: number;
      sand: number;
      gravel: number;
      water: number;
    };
    /** Material total */
    total: {
      cement: number;
      sand: number;
      gravel: number;
      water: number;
    };
  };

  /** Avisos não-bloqueantes (ex: limites normativos aplicados) */
  warnings: string[];
}
