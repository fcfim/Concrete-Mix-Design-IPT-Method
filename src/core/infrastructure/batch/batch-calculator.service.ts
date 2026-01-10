/**
 * BatchCalculatorService - Serviço de cálculo de batches
 *
 * Calcula a quantidade de material necessária por batch
 * baseado nas dimensões do recipiente e volume total desejado.
 *
 * @see Método IPT/EPUSP - Traço de betoneira
 */
import {
  MixerContainer,
  BatchResult,
  calculateContainerVolume,
} from "../../domain/entities/mixer-container";

interface ConsumptionValues {
  cement: number;
  sand: number;
  gravel: number;
  water: number;
}

export class BatchCalculatorService {
  /**
   * Calcula batches necessários e material por batch
   *
   * @param consumption Consumo por m³ de concreto (kg/m³)
   * @param container Configuração do recipiente
   * @param totalVolume Volume total de concreto desejado (m³)
   * @returns Resultado do cálculo de batches
   */
  static calculate(
    consumption: ConsumptionValues,
    container: MixerContainer,
    totalVolume: number
  ): BatchResult {
    const containerVolume = calculateContainerVolume(container);

    // Número de batches necessários (arredondado para cima)
    const numberOfBatches = Math.ceil(totalVolume / containerVolume);

    // Material por batch (baseado no volume do container)
    const perBatch = {
      cement: this.round(consumption.cement * containerVolume, 1),
      sand: this.round(consumption.sand * containerVolume, 1),
      gravel: this.round(consumption.gravel * containerVolume, 1),
      water: this.round(consumption.water * containerVolume, 1),
    };

    // Material total (baseado no volume total)
    const total = {
      cement: this.round(consumption.cement * totalVolume, 1),
      sand: this.round(consumption.sand * totalVolume, 1),
      gravel: this.round(consumption.gravel * totalVolume, 1),
      water: this.round(consumption.water * totalVolume, 1),
    };

    return {
      containerVolume: this.round(containerVolume, 4),
      totalVolume,
      numberOfBatches,
      perBatch,
      total,
    };
  }

  /**
   * Calcula batches com arredondamento prático para obra
   *
   * @param consumption Consumo por m³
   * @param container Configuração do recipiente
   * @param totalVolume Volume total desejado
   * @param cementBagSize Tamanho do saco de cimento (kg), default 50
   * @returns Resultado com arredondamento prático
   */
  static calculateWithRounding(
    consumption: ConsumptionValues,
    container: MixerContainer,
    totalVolume: number,
    cementBagSize: number = 50
  ): BatchResult & { cementBagsPerBatch: number; totalCementBags: number } {
    const result = this.calculate(consumption, container, totalVolume);

    return {
      ...result,
      perBatch: {
        cement: Math.round(result.perBatch.cement),
        sand: Math.round(result.perBatch.sand),
        gravel: Math.round(result.perBatch.gravel),
        water: Math.round(result.perBatch.water),
      },
      total: {
        cement: Math.round(result.total.cement),
        sand: Math.round(result.total.sand),
        gravel: Math.round(result.total.gravel),
        water: Math.round(result.total.water),
      },
      cementBagsPerBatch: Math.ceil(result.perBatch.cement / cementBagSize),
      totalCementBags: Math.ceil(result.total.cement / cementBagSize),
    };
  }

  private static round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
