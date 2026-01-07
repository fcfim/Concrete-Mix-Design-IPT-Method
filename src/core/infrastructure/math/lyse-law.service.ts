/**
 * LyseLawService - Lei de Lyse
 *
 * A Lei de Lyse relaciona o traço seco (m) com a relação água/cimento,
 * mantendo a consistência (abatimento) constante:
 *
 * m = k3 + k4 × (a/c)
 *
 * Onde:
 * - m: Traço seco (proporção agregados/cimento)
 * - a/c: Relação água/cimento em massa
 * - k3, k4: Constantes experimentais
 *
 * Esta lei já é linear, não necessita linearização.
 *
 * @see Lyse (1932) - Estudos sobre trabalhabilidade do concreto
 */
import { ExperimentalPoint } from "../../domain/entities/experimental-point";
import {
  LinearRegressionService,
  RegressionResult,
} from "./linear-regression.service";

export interface LyseCoefficients {
  /** Constante k3 (intercepto) */
  k3: number;
  /** Constante k4 (inclinação) */
  k4: number;
  /** Coeficiente de determinação R² da regressão */
  r2: number;
}

export class LyseLawService {
  /**
   * Calcula os coeficientes k3 e k4 a partir dos pontos experimentais
   *
   * @param points Array de pontos experimentais (mínimo 3)
   * @returns Coeficientes k3, k4 e R²
   */
  static calculateCoefficients(points: ExperimentalPoint[]): LyseCoefficients {
    if (points.length < 3) {
      throw new Error("São necessários pelo menos 3 pontos experimentais");
    }

    // X = a/c (relação água/cimento)
    const X = points.map((p) => p.ac);

    // Y = m (traço seco)
    const Y = points.map((p) => p.m);

    // Regressão linear: m = k3 + k4 × (a/c)
    const regression: RegressionResult = LinearRegressionService.calculate(
      X,
      Y
    );

    return {
      k3: this.roundToDecimal(regression.intercept, 4),
      k4: this.roundToDecimal(regression.slope, 4),
      r2: regression.r2,
    };
  }

  /**
   * Calcula o traço seco (m) para uma dada relação a/c
   *
   * m = k3 + k4 × (a/c)
   *
   * @param ac Relação água/cimento
   * @param coefficients Coeficientes k3 e k4
   * @returns Traço seco (m)
   */
  static calculateM(ac: number, coefficients: LyseCoefficients): number {
    if (ac <= 0) {
      throw new Error("Relação a/c deve ser positiva");
    }

    const m = coefficients.k3 + coefficients.k4 * ac;
    return this.roundToDecimal(m, 4);
  }

  /**
   * Calcula a relação a/c para um dado traço seco
   *
   * a/c = (m - k3) / k4
   *
   * @param m Traço seco desejado
   * @param coefficients Coeficientes k3 e k4
   * @returns Relação a/c
   */
  static calculateAC(m: number, coefficients: LyseCoefficients): number {
    if (coefficients.k4 === 0) {
      throw new Error("k4 não pode ser zero");
    }

    const ac = (m - coefficients.k3) / coefficients.k4;
    return this.roundToDecimal(ac, 4);
  }

  private static roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
