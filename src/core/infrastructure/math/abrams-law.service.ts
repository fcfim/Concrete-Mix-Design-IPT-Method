/**
 * AbramsLawService - Lei de Abrams
 *
 * A Lei de Abrams relaciona a resistência à compressão do concreto
 * com a relação água/cimento:
 *
 * fcj = k1 / k2^(a/c)
 *
 * Onde:
 * - fcj: Resistência à compressão (MPa)
 * - a/c: Relação água/cimento em massa
 * - k1, k2: Constantes experimentais do material
 *
 * Para regressão, linearizamos usando logaritmo:
 * log(fcj) = log(k1) - (a/c) × log(k2)
 *
 * Na forma Y = A + BX:
 * - Y = log(fcj)
 * - X = a/c
 * - A = log(k1) → k1 = 10^A
 * - B = -log(k2) → k2 = 10^(-B)
 *
 * @see Duff Abrams (1918) - "Design of Concrete Mixtures"
 */
import { ExperimentalPoint } from "../../domain/entities/experimental-point";
import {
  LinearRegressionService,
  RegressionResult,
} from "./linear-regression.service";

export interface AbramsCoefficients {
  /** Constante k1 (resistência limite quando a/c → 0) */
  k1: number;
  /** Constante k2 (base da exponencial, tipicamente entre 10-20) */
  k2: number;
  /** Coeficiente de determinação R² da regressão */
  r2: number;
}

export class AbramsLawService {
  /**
   * Calcula os coeficientes k1 e k2 a partir dos pontos experimentais
   *
   * @param points Array de pontos experimentais (mínimo 3)
   * @returns Coeficientes k1, k2 e R²
   */
  static calculateCoefficients(
    points: ExperimentalPoint[]
  ): AbramsCoefficients {
    if (points.length < 3) {
      throw new Error("São necessários pelo menos 3 pontos experimentais");
    }

    // X = a/c (relação água/cimento)
    const X = points.map((p) => p.ac);

    // Y = log10(fcj) (logaritmo da resistência)
    const Y = points.map((p) => Math.log10(p.fcj));

    // Regressão linear: log(fcj) = A + B × (a/c)
    const regression: RegressionResult = LinearRegressionService.calculate(
      X,
      Y
    );

    // Recuperando k1 e k2:
    // A = log(k1) → k1 = 10^A
    // B = -log(k2) → k2 = 10^(-B)
    const k1 = Math.pow(10, regression.intercept);
    const k2 = Math.pow(10, -regression.slope);

    return {
      k1: this.roundToDecimal(k1, 4),
      k2: this.roundToDecimal(k2, 4),
      r2: regression.r2,
    };
  }

  /**
   * Calcula a relação a/c necessária para atingir uma resistência alvo
   *
   * Da Lei de Abrams: fcj = k1 / k2^(a/c)
   * Isolando a/c: a/c = log(k1/fcj) / log(k2)
   *
   * @param fcjTarget Resistência de dosagem desejada (MPa)
   * @param coefficients Coeficientes k1 e k2
   * @returns Relação a/c necessária
   */
  static calculateTargetAC(
    fcjTarget: number,
    coefficients: AbramsCoefficients
  ): number {
    if (fcjTarget <= 0) {
      throw new Error("Resistência alvo deve ser positiva");
    }
    if (fcjTarget >= coefficients.k1) {
      throw new Error(
        `Resistência alvo (${fcjTarget} MPa) deve ser menor que k1 (${coefficients.k1} MPa)`
      );
    }

    const ac =
      (Math.log10(coefficients.k1) - Math.log10(fcjTarget)) /
      Math.log10(coefficients.k2);

    return this.roundToDecimal(ac, 4);
  }

  /**
   * Calcula a resistência para uma dada relação a/c
   *
   * fcj = k1 / k2^(a/c)
   *
   * @param ac Relação água/cimento
   * @param coefficients Coeficientes k1 e k2
   * @returns Resistência estimada (MPa)
   */
  static calculateStrength(
    ac: number,
    coefficients: AbramsCoefficients
  ): number {
    if (ac <= 0) {
      throw new Error("Relação a/c deve ser positiva");
    }

    const fcj = coefficients.k1 / Math.pow(coefficients.k2, ac);
    return this.roundToDecimal(fcj, 2);
  }

  private static roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
