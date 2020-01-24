export enum ContestModes {
  None = 0,
  Rating = 1,
}

export const contestModesMap = {
  [ContestModes.None]: {
    name: '--',
  },
  [ContestModes.Rating]: {
    name: 'Rating',
  },
};

const contestModes = [
  {
    id: ContestModes.None,
    name: '--',
  },
  {
    id: ContestModes.Rating,
    name: 'Rating',
  },
];

export default contestModes;
