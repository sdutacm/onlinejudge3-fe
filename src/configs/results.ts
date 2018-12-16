const resultsMap = {
  0: {
    shortName: 'WT',
    fullName: 'Waiting',
  },
  1: {
    shortName: 'AC',
    fullName: 'Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'The solution passed all test cases',
  },
  2: {
    shortName: 'TLE',
    fullName: 'Time Limit Exceeded',
    normalColor: 'red',
    colorfulColor: 'skyblue',
    description: 'The solution\'s time usage exceeded the limit of some test cases',
  },
  3: {
    shortName: 'MLE',
    fullName: 'Memory Limit Exceeded',
    normalColor: 'red',
    colorfulColor: 'skyblue',
    description: 'The solution\'s memory usage exceeded the limit of some test cases',
  },
  4: {
    shortName: 'WA',
    fullName: 'Wrong Answer',
    normalColor: 'red',
    colorfulColor: 'red',
    description: 'The solution failed some test cases',
  },
  5: {
    shortName: 'RTE',
    fullName: 'Runtime Error',
    normalColor: 'red',
    colorfulColor: 'purple',
    description: 'Error occurred at runtime',
  },
  6: {
    shortName: 'OLE',
    fullName: 'Output Limit Exceeded',
    normalColor: 'red',
    colorfulColor: 'skyblue',
    description: 'The solution\'s output exceeded the limit of some test cases',
  },
  7: {
    shortName: 'CE',
    fullName: 'Compile Error',
    normalColor: 'red',
    colorfulColor: 'yellow',
    description: 'Compile error occurred before running on test cases',
  },
  8: {
    shortName: 'PE',
    fullName: 'Presentation Error',
    normalColor: 'red',
    colorfulColor: 'red',
    description: 'The solution is almost right. Check the output format carefully',
  },
  11: {
    shortName: 'SE',
    fullName: 'System Error',
    normalColor: 'red',
    colorfulColor: 'gray',
    description: 'Judger error occurred. Please report the issue to us',
  },
  12: {
    shortName: 'JG',
    fullName: 'Judging',
  },
};

const results = [];
for (const id in resultsMap) {
  const result = resultsMap[id];
  if (result.shortName === 'WT' || result.shortName === 'JG') {
    continue;
  }
  results.push({
    ...result,
    id,
  });
}

export default results;
export { resultsMap };

