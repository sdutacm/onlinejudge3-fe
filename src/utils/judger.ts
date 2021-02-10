import Results from '@/configs/results/resultsEnum';

export function decodeJudgeStatusBuffer(buffer: ArrayBuffer): IJudgeStatus {
  const dv = new DataView(buffer);
  const solutionId = dv.getUint32(0);
  const type = dv.getUint8(4);
  const result = dv.getUint8(5);
  const current = dv.getUint8(6);
  const total = dv.getUint8(7);
  return {
    solutionId,
    type,
    result,
    current,
    total,
  };
}

export function isFinishedResult(result: Results): boolean {
  switch (result) {
    case Results.WT:
    case Results.JG:
    case Results.RPD:
      return false;
    default:
      return true;
  }
}
