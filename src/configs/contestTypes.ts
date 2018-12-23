export enum ContestTypes {
  Public = 3,
  Private = 1,
  Register = 2,
}

export const contestTypesMap = {
  [ContestTypes.Public]: {
    name: 'Public',
  },
  [ContestTypes.Private]: {
    name: 'Private',
  },
  [ContestTypes.Register]: {
    name: 'Register',
  },
};

const contestTypes = [];
for (const id in contestTypesMap) {
  const result = contestTypesMap[id];
  contestTypes.push({
    ...result,
    id: +id,
  });
}

export default contestTypes;
