/**
 * MolinariLawService - Lei de Molinari / Priszkulnik & Kirilos
 *
 * Relaciona o consumo de cimento (C) com o traço seco (m):
 *
 * C = 1000 / (k5 + k6 × m)
 *
 * Onde:
 * - C: Consumo de cimento (kg/m³)
 * - m: Traço seco (proporção agregados/cimento)
 * - k5, k6: Constantes experimentais
 *
 * Para regressão, linearizamos:
 * 1000/C = k5 + k6 × m
 *
 * Na forma Y = A + BX:
 * - Y = 1000/C
 * - X = m
 * - A = k5
 * - B = k6
 *
 * O consumo C é calculado a partir da massa específica:
 * C = (1000 × γ) / (1 + m + a/c)
 *
 * @see Molinari (1960s) / Priszkulnik & Kirilos (1980s)
 */
import { ExperimentalPoint } from "../../domain/entities/experimental-point";
import {
  LinearRegressionService,
  RegressionResult,
} from "./linear-regression.service";

export interface MolinariCoefficients {
  /** Constante k5 (intercepto) */
  k5: number;
  /** Constante k6 (inclinação) */
  k6: number;
  /** Coeficiente de determinação R² da regressão */
  r2: number;
}

export class MolinariLawService {
  /**
   * Calcula o consumo de cimento experimental para um ponto
   *
   * C = (1000 × γ) / (1 + m + a/c)
   *
   * Onde γ é a massa específica do concreto (kg/dm³ = g/cm³)
   * Nota: density em kg/m³ deve ser convertido para kg/dm³ dividindo por 1000
   *
   * @param point Ponto experimental
   * @returns Consumo de cimento (kg/m³)
   */
  static calculateConsumption(point: ExperimentalPoint): number {
    // Converter density de kg/m³ para kg/dm³
    const densityDm3 = point.density / 1000;

    // C = (1000 × γ) / (1 + m + a/c)
    const consumption = (1000 * densityDm3) / (1 + point.m + point.ac);

    return this.roundToDecimal(consumption, 2);
  }

  /**
   * Calcula os coeficientes k5 e k6 a partir dos pontos experimentais
   *
   * @param points Array de pontos experimentais (mínimo 3)
   * @returns Coeficientes k5, k6 e R²
   */
  static calculateCoefficients(
    points: ExperimentalPoint[]
  ): MolinariCoefficients {
    if (points.length < 3) {
      throw new Error("São necessários pelo menos 3 pontos experimentais");
    }

    // X = m (traço seco)
    const X = points.map((p) => p.m);

    // Y = 1000/C (inverso do consumo)
    const consumptions = points.map((p) => this.calculateConsumption(p));
    const Y = consumptions.map((c) => 1000 / c);

    // Regressão linear: 1000/C = k5 + k6 × m
    const regression: RegressionResult = LinearRegressionService.calculate(
      X,
      Y
    );

    return {
      k5: this.roundToDecimal(regression.intercept, 6),
      k6: this.roundToDecimal(regression.slope, 6),
      r2: regression.r2,
    };
  }

  /**
   * Calcula o consumo de cimento para um dado traço seco
   *
   * C = 1000 / (k5 + k6 × m)
   *
   * @param m Traço seco
   * @param coefficients Coeficientes k5 e k6
   * @returns Consumo de cimento (kg/m³)
   */
  static calculateC(m: number, coefficients: MolinariCoefficients): number {
    if (m <= 0) {
      throw new Error("Traço seco (m) deve ser positivo");
    }

    const denominator = coefficients.k5 + coefficients.k6 * m;
    if (denominator <= 0) {
      throw new Error("Denominador negativo ou zero na Lei de Molinari");
    }

    const C = 1000 / denominator;
    return this.roundToDecimal(C, 2);
  }

  private static roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
