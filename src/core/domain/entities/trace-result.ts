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

  /** Avisos não-bloqueantes (ex: limites normativos aplicados) */
  warnings: string[];
}
