/**
 * MixerContainer - Configuração de recipiente/betoneira
 *
 * Define as dimensões do recipiente de mistura para
 * cálculo de batches e quantidades por betonada.
 *
 * @see Método IPT/EPUSP - Traço de betoneira
 */

/** Formato do recipiente */
export type ContainerShape = "rectangular" | "circular";

/**
 * Configuração de recipiente para mistura
 */
export interface MixerContainer {
  /** Formato do recipiente */
  shape: ContainerShape;
  /** Comprimento em metros (rectangular) ou diâmetro (circular) */
  length: number;
  /** Largura em metros (apenas para rectangular) */
  width?: number;
  /** Altura em metros */
  height: number;
}

/**
 * Resultado do cálculo de batches
 */
export interface BatchResult {
  /** Volume do recipiente (m³) */
  containerVolume: number;
  /** Volume total de concreto desejado (m³) */
  totalVolume: number;
  /** Número de batches necessários */
  numberOfBatches: number;
  /** Material por batch */
  perBatch: {
    /** Cimento por batch (kg) */
    cement: number;
    /** Areia por batch (kg) */
    sand: number;
    /** Brita por batch (kg) */
    gravel: number;
    /** Água por batch (litros) */
    water: number;
  };
  /** Material total */
  total: {
    /** Cimento total (kg) */
    cement: number;
    /** Areia total (kg) */
    sand: number;
    /** Brita total (kg) */
    gravel: number;
    /** Água total (litros) */
    water: number;
  };
}

/**
 * Calcula o volume de um recipiente
 *
 * @param container Configuração do recipiente
 * @returns Volume em m³
 */
export function calculateContainerVolume(container: MixerContainer): number {
  if (container.shape === "rectangular") {
    return (
      container.length *
      (container.width ?? container.length) *
      container.height
    );
  }

  // Circular: V = π × r² × h
  const radius = container.length / 2;
  return Math.PI * radius * radius * container.height;
}

/**
 * Valida se as dimensões do recipiente são válidas
 */
export function isValidContainer(container: MixerContainer): boolean {
  return (
    container.length > 0 &&
    container.height > 0 &&
    (container.shape !== "rectangular" ||
      (container.width ?? container.length) > 0)
  );
}
