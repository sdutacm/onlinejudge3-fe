import Results from './resultsEnum';

const resultsMap = {
  [Results.WT]: {
    shortName: 'WT',
    fullName: 'Waiting',
  },
  [Results.AC]: {
    shortName: 'AC',
    fullName: 'Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'The solution passed all test cases',
  },
  [Results.TLE]: {
    shortName: 'TLE',
    fullName: 'Time Limit Exceeded',
    normalColor: 'red',
    colorfulColor: 'skyblue',
    description: 'The solution\'s time usage exceeded the limit of some test cases',
  },
  [Results.MLE]: {
    shortName: 'MLE',
    fullName: 'Memory Limit Exceeded',
    normalColor: 'red',
    colorfulColor: 'skyblue',
    description: 'The solution\'s memory usage exceeded the limit of some test cases',
  },
  [Results.WA]: {
    shortName: 'WA',
    fullName: 'Wrong Answer',
    normalColor: 'red',
    colorfulColor: 'red',
    description: 'The solution failed some test cases',
  },
  [Results.RTE]: {
    shortName: 'RTE',
    fullName: 'Runtime Error',
    normalColor: 'red',
    colorfulColor: 'purple',
    description: 'Error occurred at runtime',
  },
  [Results.OLE]: {
    shortName: 'OLE',
    fullName: 'Output Limit Exceeded',
    normalColor: 'red',
    colorfulColor: 'skyblue',
    description: 'The solution\'s output exceeded the limit of some test cases',
  },
  [Results.CE]: {
    shortName: 'CE',
    fullName: 'Compile Error',
    normalColor: 'red',
    colorfulColor: 'yellow',
    description: 'Compile error occurred before running on test cases',
  },
  [Results.PE]: {
    shortName: 'PE',
    fullName: 'Presentation Error',
    normalColor: 'red',
    colorfulColor: 'red',
    description: 'The solution is almost right. Check the output format carefully',
  },
  [Results.SE]: {
    shortName: 'SE',
    fullName: 'System Error',
    normalColor: 'red',
    colorfulColor: 'gray',
    description: 'Judger error occurred. Please report the issue to us',
  },
  [Results.JG]: {
    shortName: 'JG',
    fullName: 'Judging',
  },
};

export default resultsMap;
