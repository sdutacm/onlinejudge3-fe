import Results from '@/configs/results/resultsEnum';

export function decodeJudgeStatusBuffer(buffer: ArrayBuffer): IJudgeStatus {
  const dv = new DataView(buffer);
  const solutionId = dv.getUint32(0);
  const state = dv.getUint8(4);
  const result = dv.getUint8(5);
  const current = dv.getUint8(6);
  const total = dv.getUint8(7);
  return {
    solutionId,
    state,
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

export function isIgnoredResult(result: Results): boolean {
  return result === Results.CE || result === Results.SE || result === Results.NLF;
}

export function isAcceptedResult(result: Results): boolean {
  return result === Results.AC;
}

export function isRejectedResult(result: Results): boolean {
  return isFinishedResult(result) && !isIgnoredResult(result) && !isAcceptedResult(result);
}
