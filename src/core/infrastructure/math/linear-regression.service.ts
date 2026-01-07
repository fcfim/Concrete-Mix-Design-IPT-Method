/**
 * LinearRegressionService - Regressão Linear por Mínimos Quadrados
 *
 * Implementação pura em TypeScript para cálculo de regressão linear.
 * Usada como base para as leis de Abrams (linearizada) e Lyse.
 *
 * @example
 * const result = LinearRegressionService.calculate([0.45, 0.58, 0.72], [1.62, 1.51, 1.34]);
 * console.log(result); // { slope: -1.04, intercept: 2.09, r2: 0.999 }
 */
export interface RegressionResult {
  /** Inclinação da reta (B em Y = A + BX) */
  slope: number;
  /** Intercepto (A em Y = A + BX) */
  intercept: number;
  /** Coeficiente de determinação R² (0-1) */
  r2: number;
}

export class LinearRegressionService {
  /**
   * Calcula regressão linear Y = intercept + slope * X
   * Método: Mínimos Quadrados Ordinários (OLS)
   *
   * @param x Array de valores independentes
   * @param y Array de valores dependentes
   * @returns Slope, intercept e R²
   * @throws Error se arrays tiverem tamanhos diferentes ou menos de 2 pontos
   */
  static calculate(x: number[], y: number[]): RegressionResult {
    if (x.length !== y.length) {
      throw new Error("Arrays X e Y devem ter o mesmo tamanho");
    }
    if (x.length < 2) {
      throw new Error("São necessários pelo menos 2 pontos para regressão");
    }

    const n = x.length;

    // Somatórios
    const sumX = x.reduce((acc, val) => acc + val, 0);
    const sumY = y.reduce((acc, val) => acc + val, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0);

    // Cálculo do slope (inclinação)
    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      throw new Error("Divisão por zero: pontos X são todos iguais");
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Cálculo do R² (coeficiente de determinação)
    const yMean = sumY / n;
    const ssTotal = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
    const ssResidual = y.reduce(
      (acc, yi, i) => acc + (yi - (intercept + slope * x[i])) ** 2,
      0
    );

    // Evita divisão por zero quando todos os Y são iguais
    const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

    return {
      slope: this.roundToDecimal(slope, 6),
      intercept: this.roundToDecimal(intercept, 6),
      r2: this.roundToDecimal(r2, 6),
    };
  }

  /**
   * Arredonda para N casas decimais
   */
  private static roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
