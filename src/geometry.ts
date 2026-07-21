export interface BlueprintMetrics {
  rWrist: number;
  rTarget: number;
  rCenter: number;
  innerBound: number;
  physicalGap: number;
}

export function calculateBlueprintMetrics(
  wristMm: number,
  targetMm: number,
  avgBeadSize: number
): BlueprintMetrics {
  const rWrist = wristMm / (2 * Math.PI);
  const rTarget = targetMm / (2 * Math.PI);
  const rCenter = rWrist + (avgBeadSize / 2);
  const innerBound = rCenter - (avgBeadSize / 2);
  const physicalGap = innerBound - rWrist;
  return {
    rWrist,
    rTarget,
    rCenter,
    innerBound,
    physicalGap
  };
}

export function calculateInnerFit(totalBeadLength: number, avgBeadSize: number): number {
  if (totalBeadLength <= 0 || avgBeadSize <= 0) return 0;
  return totalBeadLength - Math.PI * avgBeadSize;
}

export function calculateBeadCountForCircumference(
  targetCircumferenceMm: number,
  beadSizeMm: number
): number {
  if (beadSizeMm <= 0) return 0;
  return (targetCircumferenceMm + Math.PI * beadSizeMm) / beadSizeMm;
}
