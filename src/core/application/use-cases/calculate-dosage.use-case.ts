/**
 * CalculateDosageUseCase - Caso de Uso Principal
 *
 * Orquestra o cálculo completo de dosagem pelo Método IPT/EPUSP:
 *
 * 1. Calcula resistência de dosagem (fcj) via NBR 12655
 * 2. Determina coeficientes das 3 leis (Abrams, Lyse, Molinari)
 * 3. Calcula a/c para resistência alvo (Lei de Abrams inversa)
 * 4. Valida restrições normativas (NBR 6118)
 * 5. Determina traço seco (m) via Lei de Lyse
 * 6. Desdobra traço em areia e brita usando teor de argamassa
 * 7. Calcula consumo de cimento via Lei de Molinari
 * 8. Calcula consumos dos demais materiais
 *
 * @see Método IPT/EPUSP de Dosagem de Concreto
 */
import {
  ExperimentalPoint,
  DosageTarget,
  TraceResult,
  RoundingConfig,
  MixerContainer,
} from "../../domain/entities";
import { FieldRoundingService } from "../../infrastructure/presentation/field-rounding.service";
import { BatchCalculatorService } from "../../infrastructure/batch/batch-calculator.service";
import {
  AbramsLawService,
  LyseLawService,
  MolinariLawService,
} from "../../infrastructure/math";
import {
  NBR6118Service,
  NBR12655Service,
  AggressivenessClass,
  ElementType,
} from "../../infrastructure/normative";

export interface DosageInput {
  experimentalPoints: ExperimentalPoint[];
  target: DosageTarget;
  /** Configuração opcional de arredondamento para valores de obra */
  roundingConfig?: RoundingConfig;
  /** Configuração opcional de recipiente para cálculo de batches */
  containerConfig?: {
    container: MixerContainer;
    totalVolume: number;
  };
}

export class CalculateDosageUseCase {
  /**
   * Executa o cálculo de dosagem completo
   *
   * @param input Dados de entrada (pontos experimentais + alvo)
   * @returns Resultado completo da dosagem
   */
  execute(input: DosageInput): TraceResult {
    const { experimentalPoints, target, roundingConfig, containerConfig } =
      input;
    const warnings: string[] = [];

    // 1. Validar quantidade de pontos
    if (experimentalPoints.length < 3) {
      throw new Error(
        "São necessários pelo menos 3 pontos experimentais (Rico, Piloto, Pobre)"
      );
    }

    // 1.1 Verificar se densidades parecem teóricas (ar aprisionado não considerado)
    const avgDensity =
      experimentalPoints.reduce((s, p) => s + p.density, 0) /
      experimentalPoints.length;
    if (avgDensity > 2450) {
      warnings.push(
        `ℹ️ Densidade média (${avgDensity.toFixed(0)} kg/m³) é alta. ` +
          `Verifique se as densidades são experimentais (com ar incorporado) ou teóricas.`
      );
    }

    // 2. Validar fck mínimo normativo
    const fckValidation = NBR6118Service.validateFck(
      target.fck,
      target.aggressivenessClass as AggressivenessClass,
      target.elementType as ElementType
    );
    if (!fckValidation.valid && fckValidation.warning) {
      warnings.push(fckValidation.warning);
    }

    // 3. Calcular resistência de dosagem (fcj = fck + 1.65 × Sd)
    const fcjTarget = NBR12655Service.calculateDosageStrength(
      target.fck,
      target.sd
    );

    // 4. Calcular coeficientes das leis de comportamento
    const abramsCoeffs =
      AbramsLawService.calculateCoefficients(experimentalPoints);
    const lyseCoeffs = LyseLawService.calculateCoefficients(experimentalPoints);
    const molinariCoeffs =
      MolinariLawService.calculateCoefficients(experimentalPoints);

    // 4.1 Validar extrapolação - extrair range experimental
    const fcjValues = experimentalPoints.map((p) => p.fcj);
    const minFcj = Math.min(...fcjValues);
    const maxFcj = Math.max(...fcjValues);
    const isExtrapolating = fcjTarget < minFcj || fcjTarget > maxFcj;
    let extrapolationPercent: number | undefined;

    if (isExtrapolating) {
      const distance =
        fcjTarget < minFcj
          ? ((minFcj - fcjTarget) / minFcj) * 100
          : ((fcjTarget - maxFcj) / maxFcj) * 100;
      extrapolationPercent = this.round(distance, 1);
      warnings.push(
        `⚠️ EXTRAPOLAÇÃO: fcj alvo (${fcjTarget.toFixed(
          1
        )} MPa) está ${extrapolationPercent}% ` +
          `fora do intervalo experimental [${minFcj.toFixed(
            1
          )}-${maxFcj.toFixed(1)} MPa]. ` +
          `Resultado pode ser impreciso.`
      );
    }

    // 5. Determinar a/c para resistência alvo (Lei de Abrams inversa)
    let targetAC = AbramsLawService.calculateTargetAC(fcjTarget, abramsCoeffs);

    // 6. Validar a/c contra limites normativos (NBR 6118)
    const acValidation = NBR6118Service.validateAC(
      targetAC,
      target.aggressivenessClass as AggressivenessClass,
      target.elementType as ElementType
    );
    if (!acValidation.valid && acValidation.warning) {
      warnings.push(acValidation.warning);
      targetAC = acValidation.adjusted;
    }

    // 7. Determinar traço seco (m) via Lei de Lyse
    const targetM = LyseLawService.calculateM(targetAC, lyseCoeffs);

    // 8. Desdobramento do traço (areia e brita) usando teor de argamassa
    // α = (1 + a) / (1 + m) × 100
    // Isolando: a = (α × (1 + m) / 100) - 1
    const alpha = target.mortarContent;
    const sand = (alpha * (1 + targetM)) / 100 - 1;
    const gravel = targetM - sand;

    // Validar que areia e brita são positivos
    if (sand <= 0) {
      warnings.push(
        `Teor de argamassa (${alpha}%) resulta em proporção negativa de areia. Ajuste o teor de argamassa.`
      );
    }
    if (gravel <= 0) {
      warnings.push(
        `Teor de argamassa (${alpha}%) resulta em proporção negativa de brita. Ajuste o teor de argamassa.`
      );
    }

    // 9. Calcular consumo de cimento via Lei de Molinari
    let cementConsumption = MolinariLawService.calculateC(
      targetM,
      molinariCoeffs
    );

    // 10. Validar consumo mínimo normativo
    const cementValidation = NBR6118Service.validateCement(
      cementConsumption,
      target.aggressivenessClass as AggressivenessClass,
      target.elementType as ElementType
    );
    if (!cementValidation.valid && cementValidation.warning) {
      warnings.push(cementValidation.warning);
      cementConsumption = cementValidation.adjusted;
    }

    // 11. Calcular consumos dos demais materiais
    // Método IPT puro: água = a/c × C (derivado dos ensaios experimentais)
    // Os pontos experimentais já refletem o slump desejado
    const sandConsumption = sand * cementConsumption;
    const gravelConsumption = gravel * cementConsumption;
    const waterConsumption = targetAC * cementConsumption;

    // 12. Montar resultado
    const result: TraceResult = {
      finalTrace: {
        cement: 1,
        sand: this.round(sand, 3),
        gravel: this.round(gravel, 3),
        water: this.round(targetAC, 3),
      },
      consumption: {
        cement: this.round(cementConsumption, 1),
        sand: this.round(sandConsumption, 1),
        gravel: this.round(gravelConsumption, 1),
        water: this.round(waterConsumption, 1),
      },
      parameters: {
        fcjTarget: this.round(fcjTarget, 2),
        targetAC: this.round(targetAC, 4),
        targetM: this.round(targetM, 4),
      },
      coefficients: {
        abrams: abramsCoeffs,
        lyse: lyseCoeffs,
        molinari: molinariCoeffs,
      },
      experimentalRange: {
        minFcj: this.round(minFcj, 1),
        maxFcj: this.round(maxFcj, 1),
        isExtrapolating,
        ...(extrapolationPercent !== undefined && { extrapolationPercent }),
      },
      // Campo opcional: consumo arredondado para obra
      ...(roundingConfig && {
        fieldConsumption: FieldRoundingService.round(
          {
            cement: cementConsumption,
            sand: sandConsumption,
            gravel: gravelConsumption,
            water: waterConsumption,
          },
          roundingConfig
        ),
      }),
      // Campo opcional: cálculo de batches para recipiente
      ...(containerConfig && {
        batchResult: BatchCalculatorService.calculate(
          {
            cement: cementConsumption,
            sand: sandConsumption,
            gravel: gravelConsumption,
            water: waterConsumption,
          },
          containerConfig.container,
          containerConfig.totalVolume
        ),
      }),
      warnings,
    };

    return result;
  }

  private round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
