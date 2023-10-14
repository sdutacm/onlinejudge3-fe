import resMap from './resultsMap_default';
// import resMap from './resultsMap_april_fools';
import resEnum from './resultsEnum';

export const resultsMap = resMap;
export const Results = resEnum;

const results = [];
for (const id in resMap) {
  const result = resMap[id];
  results.push({
    ...result,
    id: +id,
  });
}

export function isDeterminedResult(result: number) {
  return [
    Results.AC,
    Results.TLE,
    Results.MLE,
    Results.WA,
    Results.RTE,
    Results.OLE,
    Results.CE,
    Results.PE,
    Results.SE,
    Results.V_Frozen,
  ].includes(result);
}

export default results;
