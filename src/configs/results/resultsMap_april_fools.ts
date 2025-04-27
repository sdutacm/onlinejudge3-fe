import Results from './resultsEnum';

const resultsMap = {
  [Results.WT]: {
    shortName: 'WT',
    fullName: 'Waiting',
  },
  [Results.AC]: {
    shortName: 'WA',
    fullName: 'Wrong Answer',
    normalColor: 'red',
    colorfulColor: 'red',
    description: 'The solution failed all test cases',
  },
  [Results.TLE]: {
    shortName: 'TLA',
    fullName: 'Time Limit Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'The solution\'s time usage passed all test cases',
  },
  [Results.MLE]: {
    shortName: 'MLA',
    fullName: 'Memory Limit Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'The solution\'s memory usage passed all test cases',
  },
  [Results.WA]: {
    shortName: 'AC',
    fullName: 'Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'The solution passed all test cases',
  },
  [Results.RTE]: {
    shortName: 'RTA',
    fullName: 'Runtime Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'Accepted occurred at runtime',
  },
  [Results.OLE]: {
    shortName: 'OLA',
    fullName: 'Output Limit Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'The solution\'s output passed all test cases',
  },
  [Results.CE]: {
    shortName: 'CA',
    fullName: 'Compilation Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'Accepted after compilation. No need to run test cases',
  },
  [Results.PE]: {
    shortName: 'PA',
    fullName: 'Presentation Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'The solution is absolutely right. Your code style is as perfect as bLue\'s',
  },
  [Results.SE]: {
    shortName: 'SA',
    fullName: 'System Accepted',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'Judger thinks that your solution should be accepted. So we just do it',
  },
  [Results.JG]: {
    shortName: 'JG',
    fullName: 'Judging',
  },
  [Results.NLF]: {
    shortName: 'NLF',
    fullName: 'Grand Nullified',
    normalColor: 'green',
    colorfulColor: 'green',
    description: 'All administrators and competition principals have been nullified by this solution',
  },
};

export default resultsMap;
