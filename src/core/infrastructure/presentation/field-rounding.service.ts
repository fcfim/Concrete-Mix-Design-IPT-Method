/**
 * FieldRoundingService - Serviço de arredondamento para obra
 *
 * Converte valores de consumo precisos para valores práticos
 * de uso em campo (betoneira).
 *
 * @see Método IPT/EPUSP - Traço de betoneira
 */
import {
  RoundingConfig,
  FieldConsumption,
  DEFAULT_ROUNDING_CONFIG,
} from "../../domain/entities/rounding-config";

interface ConsumptionValues {
  cement: number;
  sand: number;
  gravel: number;
  water: number;
}

export class FieldRoundingService {
  /**
   * Arredonda valores de consumo para valores práticos de obra
   *
   * @param consumption Valores de consumo precisos (kg/m³ ou L/m³)
   * @param config Configuração de arredondamento
   * @returns Valores arredondados para uso em campo
   */
  static round(
    consumption: ConsumptionValues,
    config: RoundingConfig = DEFAULT_ROUNDING_CONFIG
  ): FieldConsumption {
    const roundedCement =
      Math.round(consumption.cement / config.cementIncrement) *
      config.cementIncrement;
    const roundedSand =
      Math.round(consumption.sand / config.aggregateIncrement) *
      config.aggregateIncrement;
    const roundedGravel =
      Math.round(consumption.gravel / config.aggregateIncrement) *
      config.aggregateIncrement;
    const roundedWater =
      Math.round(consumption.water / config.waterIncrement) *
      config.waterIncrement;

    return {
      cement: roundedCement,
      sand: roundedSand,
      gravel: roundedGravel,
      water: roundedWater,
      // Número de sacos de cimento (se increment = 50kg)
      ...(config.cementIncrement === 50 && {
        cementBags: Math.ceil(consumption.cement / 50),
      }),
    };
  }

  /**
   * Escala valores de consumo para um volume específico de concreto
   *
   * @param consumption Valores de consumo por m³
   * @param volume Volume desejado em m³
   * @param config Configuração de arredondamento opcional
   * @returns Valores escalados (e opcionalmente arredondados)
   */
  static scaleToVolume(
    consumption: ConsumptionValues,
    volume: number,
    config?: RoundingConfig
  ): FieldConsumption {
    const scaled: ConsumptionValues = {
      cement: consumption.cement * volume,
      sand: consumption.sand * volume,
      gravel: consumption.gravel * volume,
      water: consumption.water * volume,
    };

    if (config) {
      return this.round(scaled, config);
    }

    return {
      cement: Math.round(scaled.cement * 10) / 10,
      sand: Math.round(scaled.sand * 10) / 10,
      gravel: Math.round(scaled.gravel * 10) / 10,
      water: Math.round(scaled.water * 10) / 10,
    };
  }
}
