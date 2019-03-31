import resMap from './resultsMap_april_fools';
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

export default results;
